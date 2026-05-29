import random
import heapq
from collections import defaultdict, deque

# -----------------------------------------
# FAKE DATABASE
# -----------------------------------------

DB = {
    "topics": {
        1: {
            "name": "Traffic Signs",
            "parent": None,
            "subtopics": [11, 12],
            "questions": [101, 102],
        },
        2: {
            "name": "Right of Way",
            "parent": None,
            "subtopics": [21],
            "questions": [201, 202, 203],
        },
    },
    "subtopics": {
        11: {"parent": 1, "questions": [111, 112, 113]},
        12: {"parent": 1, "questions": [121, 122]},
        21: {"parent": 2, "questions": [211, 212, 213, 214]},
    },
}


def get_top_topics():
    return [tid for tid, t in DB["topics"].items() if t["parent"] is None]


def get_subtopics(topic_id):
    return DB["topics"][topic_id]["subtopics"]


def get_subtopic_questions(sub_id):
    return DB["subtopics"][sub_id]["questions"]


def get_parent_questions(topic_id):
    return DB["topics"][topic_id]["questions"]


def get_parent_topic_of_question(qid):
    # find subtopic
    for sid, sub in DB["subtopics"].items():
        if qid in sub["questions"]:
            return sub["parent"]
    # find parent topic
    for tid, t in DB["topics"].items():
        if qid in t["questions"]:
            return tid
    return None


# -----------------------------------------
# CORRECTED RANDOM QUIZ GENERATOR
# -----------------------------------------


def generate_random_quiz(TARGET_SIZE):

    top_topics = get_top_topics()

    # Build topic data
    topic_data = {}
    for tid in top_topics:
        subtopics = get_subtopics(tid)
        sub_qs = {sid: get_subtopic_questions(sid)[:] for sid in subtopics}
        parent_qs = get_parent_questions(tid)[:]
        total = sum(len(v) for v in sub_qs.values()) + len(parent_qs)
        topic_data[tid] = {
            "subtopics": sub_qs,
            "parent_questions": parent_qs,
            "total_available": total,
        }

    # Quota distribution
    T = len(top_topics)
    base_quota = TARGET_SIZE // T
    leftover = TARGET_SIZE % T
    topic_quota = {tid: base_quota for tid in top_topics}

    sorted_topics = sorted(
        top_topics, key=lambda t: topic_data[t]["total_available"], reverse=True
    )
    for i in range(leftover):
        topic_quota[sorted_topics[i]] += 1

    selected = defaultdict(list)
    global_shortage = 0

    # Select questions
    for tid in top_topics:
        quota = topic_quota[tid]
        data = topic_data[tid]
        subtopics = data["subtopics"]
        parent_qs = data["parent_questions"]
        random.shuffle(parent_qs)

        S = len(subtopics) if subtopics else 1
        sub_quota = quota // S
        sub_leftover = quota % S

        # Base subtopic allocation
        for sid, qs in subtopics.items():
            qs_copy = qs[:]
            random.shuffle(qs_copy)
            take = min(len(qs_copy), sub_quota)
            selected[tid].extend(qs_copy[:take])
            if take < sub_quota:
                global_shortage += sub_quota - take

        # Leftover distribution
        if subtopics:
            sorted_subs = sorted(
                subtopics.items(), key=lambda x: len(x[1]), reverse=True
            )
            for i in range(sub_leftover):
                sid, qs = sorted_subs[i % len(sorted_subs)]
                if qs:
                    chosen = random.choice(qs)
                    if chosen not in selected[tid]:
                        selected[tid].append(chosen)
                else:
                    global_shortage += 1

        # Fill from parent questions
        remaining = quota - len(selected[tid])
        if remaining > 0:
            take = min(len(parent_qs), remaining)
            selected[tid].extend(parent_qs[:take])
            if take < remaining:
                global_shortage += remaining - take

    # Global shortage fill
    if global_shortage > 0:
        remaining_pool = []
        for tid, data in topic_data.items():
            all_qs = [q for qs in data["subtopics"].values() for q in qs] + data[
                "parent_questions"
            ]
            remaining_pool.extend([q for q in all_qs if q not in selected[tid]])

        random.shuffle(remaining_pool)
        extra = remaining_pool[:global_shortage]
        for qid in extra:
            parent_tid = get_parent_topic_of_question(qid)
            selected[parent_tid].append(qid)

    # Flatten
    final_list = []
    topic_of = {}
    for tid, qs in selected.items():
        random.shuffle(qs)
        for q in qs:
            final_list.append(q)
            topic_of[q] = tid

    if len(final_list) > TARGET_SIZE:
        final_list = random.sample(final_list, TARGET_SIZE)

    random.shuffle(final_list)

    # Group by topic
    grouped = defaultdict(deque)
    for q in final_list:
        grouped[topic_of[q]].append(q)

    # Randomized heap
    heap = [(-len(v), random.random(), tid) for tid, v in grouped.items()]
    heapq.heapify(heap)

    ordered = []
    prev_topic = None

    while heap:
        count1, rand1, tid1 = heapq.heappop(heap)

        if tid1 == prev_topic and heap:
            count2, rand2, tid2 = heapq.heappop(heap)

            if random.random() < 0.5:
                tid_first, count_first, rand_first = tid2, count2, rand2
                tid_second, count_second, rand_second = tid1, count1, rand1
            else:
                tid_first, count_first, rand_first = tid1, count1, rand1
                tid_second, count_second, rand_second = tid2, count2, rand2

            qid = grouped[tid_first].popleft()
            ordered.append(qid)
            prev_topic = tid_first

            if grouped[tid_first]:
                heapq.heappush(
                    heap, (-len(grouped[tid_first]), random.random(), tid_first)
                )
            heapq.heappush(heap, (count_second, rand_second, tid_second))

        else:
            qid = grouped[tid1].popleft()
            ordered.append(qid)
            prev_topic = tid1
            if grouped[tid1]:
                heapq.heappush(heap, (-len(grouped[tid1]), random.random(), tid1))

    return ordered


# -----------------------------------------
# RUN 10 ATTEMPTS
# -----------------------------------------

print("\n=== QUIZ GENERATION DEMO (10 attempts) ===\n")

for i in range(1, 10 + 1):
    quiz = generate_random_quiz(6)
    print(f"Attempt {i}: {quiz}")
