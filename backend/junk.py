
def _generate_random_quiz(quiz_size):
    
    TARGET_SIZE = quiz_size
    top_topics = Topic.query.filter_by(parent_topic=None).all()
    if not top_topics:
        return {
                "status": False,
                "message": "No topics found",
                "_event_type": "quiz_generation_failed",
                "_event_metadata": {"reason": "no_topics"}
            }, 404

    topic_data = {}
    for topic in top_topics:
        subtopics = topic.subtopics
        sub_qs = {sub.topic_id: [q.question_id for q in sub.questions] for sub in subtopics}
        parent_qs = [q.question_id for q in topic.questions]
        total = sum(len(v) for v in sub_qs.values()) + len(parent_qs)
        topic_data[topic.topic_id] = {
            "subtopics": sub_qs, "parent_questions": parent_qs, "total_available": total
        }

    T = len(top_topics)
    base_quota = TARGET_SIZE // T
    leftover = TARGET_SIZE % T
    topic_quota = {t.topic_id: base_quota for t in top_topics}
    sorted_topics = sorted(top_topics, key=lambda t: topic_data[t.topic_id]["total_available"], reverse=True)
    for i in range(leftover):
        topic_quota[sorted_topics[i].topic_id] += 1

    selected = defaultdict(list)
    global_shortage = 0

    for topic in top_topics:
        tid = topic.topic_id
        quota = topic_quota[tid]
        data = topic_data[tid]
        subtopics = data["subtopics"]
        parent_qs = data["parent_questions"]
        S = len(subtopics) if subtopics else 1
        sub_quota = quota // S
        sub_leftover = quota % S

        for sid, qs in subtopics.items():
            take = min(len(qs), sub_quota)
            selected[tid].extend(random.sample(qs, take))
            if take < sub_quota:
                global_shortage += (sub_quota - take)

        if subtopics:
            sorted_subs = sorted(subtopics.items(), key=lambda x: len(x[1]), reverse=True)
            for i in range(sub_leftover):
                sid, qs = sorted_subs[i % len(sorted_subs)]
                if qs:
                    chosen = random.choice(qs)
                    if chosen not in selected[tid]:
                        selected[tid].append(chosen)
                else:
                    global_shortage += 1

        remaining = quota - len(selected[tid])
        if remaining > 0:
            take = min(len(parent_qs), remaining)
            selected[tid].extend(random.sample(parent_qs, take))
            if take < remaining:
                global_shortage += (remaining - take)

    if global_shortage > 0:
        remaining_pool = []
        for tid, data in topic_data.items():
            all_qs = [q for qs in data["subtopics"].values() for q in qs] + data["parent_questions"]
            remaining_pool.extend([q for q in all_qs if q not in selected[tid]])
        extra = random.sample(remaining_pool, min(len(remaining_pool), global_shortage))
        for qid in extra:
            q = Question.query.get(qid)
            selected[q.topic.parent_topic or q.topic.topic_id].append(qid)

    topic_of = {}
    final_list = []
    for tid, qs in selected.items():
        for q in qs:
            final_list.append(q)
            topic_of[q] = tid

    if len(final_list) > TARGET_SIZE:
        final_list = random.sample(final_list, TARGET_SIZE)

    grouped = defaultdict(deque)
    for q in final_list:
        grouped[topic_of[q]].append(q)

    heap = [(-len(v), tid) for tid, v in grouped.items()]
    heapq.heapify(heap)
    ordered = []
    prev_topic = None

    while heap:
        count1, tid1 = heapq.heappop(heap)
        if tid1 == prev_topic and heap:
            count2, tid2 = heapq.heappop(heap)
            qid = grouped[tid2].popleft()
            ordered.append(qid)
            prev_topic = tid2
            if grouped[tid2]:
                heapq.heappush(heap, (-len(grouped[tid2]), tid2))
            heapq.heappush(heap, (count1, tid1))
        else:
            qid = grouped[tid1].popleft()
            ordered.append(qid)
            prev_topic = tid1
            if grouped[tid1]:
                heapq.heappush(heap, (-len(grouped[tid1]), tid1))
    
    
    
    return {
            "status": True,
            "questions": ordered,
            "_event_type": "quiz_generation_success",
            "_event_metadata": {
                "quiz_size": TARGET_SIZE,
                "selected_count": len(ordered)
            }
        }, 200