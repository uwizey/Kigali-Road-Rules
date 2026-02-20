// ============================================
// PLACEHOLDER DATA - EASY TO REPLACE FROM BACKEND
// ============================================

import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

let currentQuestions = []; // holds raw fetched questions before normalization
const useremail = document.getElementById("userEmail");

// ===== CONTENT MODE DATA =====
const CONTENT_DATA = {
  topics: [
    {
      id: "overview",
      title: "Overview",
      icon: "fas fa-map",
      subtopics: [
        {
          id: "intro",
          title: "Introduction",
          formatType: "flip_card",
          content: {
            cards: [
              {
                image:
                  "https://via.placeholder.com/400x300/0097b2/ffffff?text=Road+Safety",
                title: "Road Safety Basics",
                description:
                  "Understanding road safety is crucial for all drivers and pedestrians. Learn the fundamental principles that keep everyone safe on the road.",
              },
              {
                image:
                  "https://via.placeholder.com/400x300/1e40af/ffffff?text=Traffic+Rules",
                title: "Traffic Rules",
                description:
                  "Traffic rules are designed to create order and predictability on the roads. Following these rules prevents accidents and saves lives.",
              },
              {
                image:
                  "https://via.placeholder.com/400x300/16a34a/ffffff?text=Driver+Responsibility",
                title: "Driver Responsibility",
                description:
                  "Every driver has a responsibility to ensure their own safety and the safety of others. This includes being alert, following rules, and maintaining your vehicle.",
              },
            ],
          },
          exercise: {
            questions: [
              {
                question: "What is the primary purpose of traffic rules?",
                options: [
                  "To make driving difficult",
                  "To create order and prevent accidents",
                  "To generate revenue",
                  "To slow down traffic",
                ],
                correctAnswer: 1,
              },
              {
                question: "Who is responsible for road safety?",
                options: [
                  "Only the police",
                  "Only drivers",
                  "Everyone using the road",
                  "Only pedestrians",
                ],
                correctAnswer: 2,
              },
            ],
          },
        },
        {
          id: "getting-started",
          title: "Getting Started",
          formatType: "image_right",
          content: {
            title: "Your Journey to Safe Driving",
            text: [
              "Starting your driving journey requires preparation and knowledge. Before you get behind the wheel, it's essential to understand the basics of vehicle operation and road safety.",
              "The first step is obtaining your learner's permit. This involves studying traffic laws, understanding road signs, and passing a written examination. Take your time to study and ensure you understand all the material.",
              "Practice is crucial. Start in low-traffic areas and gradually progress to busier roads as you gain confidence. Always practice with a licensed driver who can provide guidance and feedback.",
              "Remember that learning to drive is a gradual process. Don't rush - focus on building good habits from the beginning.",
            ],
            image:
              "https://via.placeholder.com/400x500/0097b2/ffffff?text=Getting+Started",
          },
          exercise: {
            questions: [
              {
                question: "What should you do before getting behind the wheel?",
                options: [
                  "Jump in and start driving",
                  "Study traffic laws and understand road signs",
                  "Buy an expensive car",
                  "Get insurance only",
                ],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "basics",
          title: "Road Basics",
          formatType: "accordion",
          content: {
            sections: [
              {
                title: "Understanding Road Markings",
                text: "Road markings are painted lines and symbols on the road surface that provide information to drivers. White lines separate lanes of traffic moving in the same direction, while yellow lines separate traffic moving in opposite directions.",
                image:
                  "https://via.placeholder.com/500x300/0097b2/ffffff?text=Road+Markings",
              },
              {
                title: "Lane Discipline",
                text: "Maintaining proper lane discipline is essential for safe driving. Always stay in your lane unless you need to change lanes. Use your turn signals before changing lanes and check your mirrors and blind spots.",
                image:
                  "https://via.placeholder.com/500x300/1e40af/ffffff?text=Lane+Discipline",
              },
              {
                title: "Speed Management",
                text: "Driving at appropriate speeds is crucial for safety. Always observe posted speed limits and adjust your speed based on road conditions, weather, and traffic. Remember that speed limits are maximums, not targets.",
                image:
                  "https://via.placeholder.com/500x300/16a34a/ffffff?text=Speed+Management",
              },
            ],
          },
          exercise: {
            questions: [
              {
                question:
                  "What color are the lines that separate opposing traffic?",
                options: ["White", "Yellow", "Red", "Blue"],
                correctAnswer: 1,
              },
            ],
          },
        },
      ],
    },
    {
      id: "traffic-signs",
      title: "Traffic Signs",
      icon: "fas fa-traffic-light",
      subtopics: [
        {
          id: "warning",
          title: "Warning Signs",
          formatType: "timeline",
          content: {
            steps: [
              {
                title: "Sharp Curve Ahead",
                description:
                  "This sign warns you that there is a sharp curve ahead. Reduce your speed before entering the curve and maintain a safe speed throughout.",
                image:
                  "https://via.placeholder.com/400x300/f59e0b/000000?text=Curve+Warning",
              },
              {
                title: "Intersection Warning",
                description:
                  "Indicates that you are approaching an intersection. Be prepared to slow down or stop, and watch for cross traffic.",
                image:
                  "https://via.placeholder.com/400x300/f59e0b/000000?text=Intersection",
              },
              {
                title: "Animal Crossing",
                description:
                  "Watch for animals that may cross the road. Be especially alert during dawn and dusk when animals are most active.",
                image:
                  "https://via.placeholder.com/400x300/f59e0b/000000?text=Animal+Crossing",
              },
            ],
          },
          exercise: {
            questions: [
              {
                question:
                  "What should you do when you see a curve warning sign?",
                options: [
                  "Speed up",
                  "Reduce speed before the curve",
                  "Ignore it",
                  "Honk your horn",
                ],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "regulatory",
          title: "Regulatory Signs",
          formatType: "tabs",
          content: {
            tabs: [
              {
                title: "Stop Signs",
                content:
                  "A stop sign requires you to come to a complete stop. You must stop before the stop line, crosswalk, or intersection. Look left, right, and left again before proceeding.",
                image:
                  "https://via.placeholder.com/600x400/dc2626/ffffff?text=STOP",
              },
              {
                title: "Yield Signs",
                content:
                  "Yield signs indicate that you must slow down and be prepared to stop. Give the right-of-way to vehicles and pedestrians already in the intersection or approaching from another direction.",
                image:
                  "https://via.placeholder.com/600x400/f59e0b/ffffff?text=YIELD",
              },
              {
                title: "Speed Limit Signs",
                content:
                  "Speed limit signs show the maximum legal speed. You may drive slower than the posted speed but never faster. Adjust your speed for weather and road conditions.",
                image:
                  "https://via.placeholder.com/600x400/0097b2/ffffff?text=50+KM/H",
              },
            ],
          },
          exercise: {
            questions: [
              {
                question: "What must you do at a stop sign?",
                options: [
                  "Slow down",
                  "Come to a complete stop",
                  "Honk and proceed",
                  "Speed up",
                ],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "information",
          title: "Information Signs",
          formatType: "image_left",
          content: {
            title: "Understanding Information Signs",
            text: [
              "Information signs provide helpful details about services, destinations, and points of interest. They are typically blue or green and are designed to help you navigate.",
              "Green signs indicate directions and distances to cities and towns. Blue signs show services such as gas stations, hospitals, and rest areas.",
              "Brown signs point to recreational areas, parks, and tourist attractions. These signs help you plan your route and find necessary services along the way.",
            ],
            image:
              "https://via.placeholder.com/400x500/16a34a/ffffff?text=Information+Signs",
          },
          exercise: {
            questions: [
              {
                question: "What color are service information signs?",
                options: ["Red", "Green", "Blue", "Yellow"],
                correctAnswer: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: "road-rules",
      title: "Road Rules",
      icon: "fas fa-road",
      subtopics: [
        {
          id: "speed-limits",
          title: "Speed Limits",
          formatType: "image_overlay",
          content: {
            title: "Understanding Speed Limits",
            description:
              "Speed limits are set to ensure the safety of all road users. They vary depending on the type of road, location, and conditions. Always observe posted limits and adjust your speed for weather and traffic.",
            image:
              "https://via.placeholder.com/1200x500/0097b2/ffffff?text=Speed+Limits",
          },
          exercise: {
            questions: [
              {
                question: "Can you drive faster than the posted speed limit?",
                options: [
                  "Yes, if traffic is light",
                  "Yes, if you're in a hurry",
                  "No, never",
                  "Yes, on highways only",
                ],
                correctAnswer: 2,
              },
            ],
          },
        },
        {
          id: "right-of-way",
          title: "Right of Way",
          formatType: "flip_card",
          content: {
            cards: [
              {
                image:
                  "https://via.placeholder.com/400x300/0097b2/ffffff?text=Intersection",
                title: "At Intersections",
                description:
                  "At a four-way stop, the first vehicle to arrive has the right-of-way. If multiple vehicles arrive simultaneously, the vehicle on the right has priority.",
              },
              {
                image:
                  "https://via.placeholder.com/400x300/1e40af/ffffff?text=Pedestrian",
                title: "Pedestrian Crossings",
                description:
                  "Pedestrians always have the right-of-way at marked crosswalks. Always stop and allow them to cross safely before proceeding.",
              },
              {
                image:
                  "https://via.placeholder.com/400x300/16a34a/ffffff?text=Emergency",
                title: "Emergency Vehicles",
                description:
                  "Emergency vehicles with lights and sirens always have the right-of-way. Pull over to the right and stop until they pass.",
              },
            ],
          },
          exercise: {
            questions: [
              {
                question: "Who has the right-of-way at a pedestrian crossing?",
                options: [
                  "The driver",
                  "The pedestrian",
                  "Whoever gets there first",
                  "The larger vehicle",
                ],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "parking",
          title: "Parking Rules",
          formatType: "accordion",
          content: {
            sections: [
              {
                title: "Parallel Parking",
                text: "When parallel parking, ensure you are within 30cm of the curb. Turn your wheels away from the curb when parking uphill, and toward the curb when parking downhill.",
                image:
                  "https://via.placeholder.com/500x300/0097b2/ffffff?text=Parallel+Parking",
              },
              {
                title: "No Parking Zones",
                text: "Never park in fire lanes, in front of driveways, within 5 meters of a fire hydrant, or in designated no-parking zones. Violations can result in fines and towing.",
                image:
                  "https://via.placeholder.com/500x300/dc2626/ffffff?text=No+Parking",
              },
              {
                title: "Parking Lots",
                text: "In parking lots, observe all signs and markings. Park within the lines, and be especially careful when backing out as visibility may be limited.",
                image:
                  "https://via.placeholder.com/500x300/16a34a/ffffff?text=Parking+Lot",
              },
            ],
          },
          exercise: {
            questions: [
              {
                question: "How close to a fire hydrant can you park?",
                options: [
                  "As close as you want",
                  "At least 3 meters away",
                  "At least 5 meters away",
                  "At least 10 meters away",
                ],
                correctAnswer: 2,
              },
            ],
          },
        },
      ],
    },
  ],
};

// ===== QUIZ MODE DATA =====
const QUIZ_DATA = {
  quizzes: [
    {
      id: "overview",
      title: "Overview",
      icon: "fas fa-map",
      questionCount: 10,
      questions: [
        {
          topic: "Overview",
          question: "What is the primary purpose of traffic rules?",
          options: [
            "To make driving difficult",
            "To create order and prevent accidents",
            "To generate revenue",
            "To slow down traffic",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Overview",
          question:
            "At what age can you apply for a learner's permit in Rwanda?",
          options: ["16 years", "17 years", "18 years", "21 years"],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Overview",
          question: "What should you always carry while driving?",
          options: [
            "Only your car keys",
            "Driver's license, registration, and insurance",
            "Just your phone",
            "Only insurance",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Overview",
          question: "Who is responsible for road safety?",
          options: [
            "Only the police",
            "Only drivers",
            "Everyone using the road",
            "Only pedestrians",
          ],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Overview",
          question: "What is defensive driving?",
          options: [
            "Driving aggressively to defend your position",
            "Anticipating potential hazards and driving safely",
            "Driving very slowly",
            "Ignoring other drivers",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Overview",
          question: "When should you use your horn?",
          options: [
            "Whenever you feel like it",
            "To greet friends",
            "Only to warn of danger",
            "In residential areas at night",
          ],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Overview",
          question: "What does a solid white line indicate?",
          options: [
            "You can cross it anytime",
            "Lane changes are discouraged",
            "Parking is allowed",
            "Speed up zone",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Overview",
          question: "What should you do before starting your vehicle?",
          options: [
            "Just turn the key and go",
            "Check mirrors, seat position, and seatbelt",
            "Turn on the radio",
            "Make a phone call",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Overview",
          question: "What is the safest following distance?",
          options: [
            "As close as possible",
            "1 second",
            "At least 3 seconds",
            "10 seconds",
          ],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Overview",
          question: "When must you yield to pedestrians?",
          options: [
            "Never",
            "Only at traffic lights",
            "Always, especially at crosswalks",
            "Only if they wave",
          ],
          correctAnswer: 2,
          image: null,
        },
      ],
    },
    {
      id: "traffic-signs",
      title: "Traffic Signs",
      icon: "fas fa-traffic-light",
      questionCount: 15,
      questions: [
        {
          topic: "Traffic Signs",
          question: "What does a red octagonal sign indicate?",
          options: ["Yield", "Stop", "Speed limit", "No parking"],
          correctAnswer: 1,
          image: "https://via.placeholder.com/300x300/dc2626/ffffff?text=STOP",
        },
        {
          topic: "Traffic Signs",
          question: "What color are warning signs typically?",
          options: ["Red", "Blue", "Yellow/Orange", "Green"],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "What does a triangular sign with red border mean?",
          options: ["Stop", "Yield/Give Way", "No Entry", "Speed Limit"],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "What do blue circular signs typically indicate?",
          options: [
            "Prohibitions",
            "Warnings",
            "Mandatory instructions",
            "Information",
          ],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "A sign with a red circle and line means:",
          options: [
            "Caution ahead",
            "Prohibited action",
            "Information available",
            "Service area",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "What does a yellow diamond sign indicate?",
          options: [
            "Stop required",
            "Warning of road conditions ahead",
            "No parking",
            "Hospital nearby",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "Green signs typically provide:",
          options: [
            "Warning information",
            "Regulatory information",
            "Directional/Guide information",
            "Construction information",
          ],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "A circular sign with diagonal line means:",
          options: [
            "End of restriction",
            "New restriction starts",
            "Caution",
            "Service available",
          ],
          correctAnswer: 0,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "What should you do when you see a school zone sign?",
          options: [
            "Speed up to pass quickly",
            "Reduce speed and watch for children",
            "Honk to alert children",
            "Maintain normal speed",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "Railroad crossing signs are what shape?",
          options: ["Circular", "Rectangular", "Circular with X", "Triangular"],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: 'What does a "No U-Turn" sign look like?',
          options: [
            "Red circle with U and line through it",
            "Blue square",
            "Yellow diamond",
            "Green rectangle",
          ],
          correctAnswer: 0,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "Brown signs indicate:",
          options: [
            "Danger zones",
            "Recreational areas or tourist attractions",
            "Construction zones",
            "School zones",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "A flashing yellow light means:",
          options: [
            "Stop immediately",
            "Proceed with caution",
            "Speed up",
            "Yield to all traffic",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: 'What does a "One Way" sign indicate?',
          options: [
            "Traffic flows in both directions",
            "Traffic flows in indicated direction only",
            "No entry",
            "Two-way traffic ahead",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Traffic Signs",
          question: "Pentagon-shaped signs are used for:",
          options: [
            "Parking areas",
            "School zones",
            "Highway exits",
            "Construction zones",
          ],
          correctAnswer: 1,
          image: null,
        },
      ],
    },
    {
      id: "road-rules",
      title: "Road Rules",
      icon: "fas fa-road",
      questionCount: 12,
      questions: [
        {
          topic: "Road Rules",
          question: "What is the typical speed limit in urban areas?",
          options: ["30 km/h", "40 km/h", "50 km/h", "60 km/h"],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "When turning right, you should:",
          options: [
            "Speed up",
            "Signal and check blind spots",
            "Never signal",
            "Turn from any lane",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "At a four-way stop, who goes first?",
          options: [
            "The largest vehicle",
            "The first to arrive",
            "The fastest driver",
            "Always the vehicle on the left",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "You must not park within ___ of a fire hydrant:",
          options: ["3 meters", "5 meters", "7 meters", "10 meters"],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "When is it legal to exceed the speed limit?",
          options: [
            "When passing",
            "In an emergency with police escort",
            "Never",
            "On highways only",
          ],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "What should you do when an emergency vehicle approaches?",
          options: [
            "Speed up",
            "Pull over to the right and stop",
            "Continue at same speed",
            "Pull over to the left",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "Seat belts must be worn by:",
          options: [
            "Only the driver",
            "Driver and front passenger",
            "All occupants",
            "No one on short trips",
          ],
          correctAnswer: 2,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "Using a mobile phone while driving is:",
          options: [
            "Allowed with hands-free",
            "Never allowed",
            "Allowed in traffic",
            "Allowed for emergencies only without hands-free",
          ],
          correctAnswer: 0,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "Before changing lanes, you must:",
          options: [
            "Just move over",
            "Check mirrors and blind spots, signal",
            "Honk your horn",
            "Flash your lights",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "The left lane on a highway is for:",
          options: [
            "Slower traffic",
            "Passing/faster traffic",
            "Trucks only",
            "Emergency vehicles only",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "You should increase following distance when:",
          options: [
            "Roads are dry",
            "Weather is poor or roads are wet",
            "Traffic is light",
            "Driving in daytime",
          ],
          correctAnswer: 1,
          image: null,
        },
        {
          topic: "Road Rules",
          question: "At a pedestrian crossing without signals, you must:",
          options: [
            "Speed up to cross before pedestrians",
            "Honk at pedestrians",
            "Yield to pedestrians",
            "Maintain your speed",
          ],
          correctAnswer: 2,
          image: null,
        },
      ],
    },
    {
      id: "latest-exam",
      title: "Latest Police Exam",
      icon: "fas fa-certificate",
      isMultiSession: true, // Flag: clicking opens exam selection screen instead of quiz directly
      sessions: [
        {
          id: "exam-jan-2025",
          title: "January 2025",
          date: "January 15, 2025",
          questionCount: 20,
          difficulty: "Medium",
          tag: "Recent",
          questions: [
            {
              topic: "Police Exam",
              question:
                "What is the maximum blood alcohol content (BAC) allowed for drivers?",
              options: ["0.00%", "0.05%", "0.08%", "0.10%"],
              correctAnswer: 0,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When must you dim your headlights?",
              options: [
                "Never",
                "When following another vehicle or meeting oncoming traffic",
                "Only in the city",
                "Only on highways",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What does a solid yellow line mean?",
              options: [
                "Passing is allowed",
                "No passing allowed",
                "Caution zone",
                "Parking zone",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "At what distance should you signal before turning?",
              options: [
                "At the turn",
                "At least 30 meters before",
                "5 meters before",
                "Signaling is optional",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What should you do if your brakes fail?",
              options: [
                "Pump the brake pedal and use emergency brake",
                "Turn off the engine",
                "Jump out of the vehicle",
                "Speed up",
              ],
              correctAnswer: 0,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "Children under what age must be in a child safety seat?",
              options: ["3 years", "5 years", "7 years", "10 years"],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When parking uphill with a curb, turn your wheels:",
              options: [
                "Away from the curb",
                "Toward the curb",
                "Straight",
                "Either way",
              ],
              correctAnswer: 0,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A flashing red traffic light means:",
              options: [
                "Proceed with caution",
                "Stop, then proceed when safe",
                "Speed up",
                "Yield",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "You are required to stop for a school bus when:",
              options: [
                "Never",
                "Only if children are visible",
                "When red lights are flashing and stop arm is extended",
                "Only during school hours",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What is the minimum tread depth required for tires?",
              options: ["1.0mm", "1.6mm", "2.0mm", "3.0mm"],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When approaching a roundabout, you should:",
              options: [
                "Speed up to enter quickly",
                "Yield to traffic already in the roundabout",
                "Honk before entering",
                "Stop completely",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Hydroplaning occurs when:",
              options: [
                "Tires lose contact with road due to water",
                "Brakes overheat",
                "Engine overheats",
                "Tire pressure is too high",
              ],
              correctAnswer: 0,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What does ABS stand for?",
              options: [
                "Automatic Brake System",
                "Anti-lock Braking System",
                "Advanced Brake Safety",
                "Assisted Braking System",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "You must report an accident to police when:",
              options: [
                "Only if someone is injured",
                "Always, regardless of damage",
                "If damage exceeds a certain amount or injuries occur",
                "Never, insurance handles it",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When is it safe to pass another vehicle?",
              options: [
                "Anytime",
                "When you have clear visibility and no oncoming traffic",
                "Only on highways",
                "Never",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What should you do in foggy conditions?",
              options: [
                "Use high beams",
                "Use low beams and fog lights, reduce speed",
                "Turn off all lights",
                "Speed up to get through quickly",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "The two-second rule refers to:",
              options: [
                "How long to signal",
                "Safe following distance",
                "Time to check mirrors",
                "Reaction time",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "You should avoid driving when:",
              options: [
                "You are well-rested",
                "You are tired, sick, or under influence",
                "It's raining lightly",
                "Traffic is heavy",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "When parallel parking, you should be within ___ of the curb:",
              options: ["15cm", "30cm", "50cm", "1 meter"],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What is the safest way to exit a highway?",
              options: [
                "Brake hard before the exit",
                "Signal early, move to exit lane, reduce speed gradually",
                "Exit quickly without signaling",
                "Maintain highway speed until the last moment",
              ],
              correctAnswer: 1,
              image: null,
            },
          ],
        },
        {
          id: "exam-oct-2024",
          title: "October 2024",
          date: "October 8, 2024",
          questionCount: 20,
          difficulty: "Hard",
          tag: "Popular",
          questions: [
            {
              topic: "Police Exam",
              question: "What is the purpose of a deceleration lane?",
              options: [
                "To overtake vehicles",
                "To allow vehicles to slow down before exiting",
                "To park temporarily",
                "For emergency vehicles only",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When is it mandatory to use hazard lights?",
              options: [
                "When driving slowly",
                "When your vehicle is stationary and causing a hazard",
                "At night only",
                "During rain",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What does a double solid white line between lanes mean?",
              options: [
                "Passing allowed",
                "Lane change prohibited",
                "Merge ahead",
                "End of road",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "The stopping distance increases by how much when you double your speed?",
              options: ["Doubles", "Triples", "Quadruples", "Stays the same"],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When must you use your vehicle's lights?",
              options: [
                "Only at night",
                "30 minutes after sunset to 30 minutes before sunrise",
                "Whenever visibility is reduced",
                "Both B and C",
              ],
              correctAnswer: 3,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What is the rule for driving on a roundabout?",
              options: [
                "Vehicles entering have priority",
                "Vehicles inside have priority",
                "Largest vehicle has priority",
                "First come first served",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "If you miss your highway exit, you should:",
              options: [
                "Reverse on the highway",
                "Take the next exit",
                "Stop and wait",
                "Make a U-turn",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What is the 'blind spot' of a vehicle?",
              options: [
                "Area seen in mirrors",
                "Area not visible in mirrors",
                "The dashboard",
                "The windshield",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When should you yield to a funeral procession?",
              options: [
                "Never",
                "Always, they have right of way",
                "Only at intersections",
                "Only if escorted by police",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A vehicle's tyres must be inflated to:",
              options: [
                "Maximum pressure on the tyre sidewall",
                "Manufacturer's recommended pressure",
                "Any pressure that feels firm",
                "50% of maximum",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What is the correct action at an uncontrolled intersection?",
              options: [
                "Speed through",
                "Yield to traffic on the right",
                "Yield to traffic on the left",
                "Honk and proceed",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "When towing a trailer, your following distance should be:",
              options: [
                "The same as normal",
                "Shorter",
                "Longer",
                "Irrelevant",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Driving with worn brake pads is:",
              options: [
                "Acceptable in dry weather",
                "Only dangerous at high speed",
                "Always illegal and dangerous",
                "Fine for short trips",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What does a yellow X above a lane indicate?",
              options: [
                "Lane is open",
                "Lane is closed, exit immediately",
                "Slow down",
                "Merge right",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Road rage is best handled by:",
              options: [
                "Responding aggressively",
                "Staying calm and avoiding conflict",
                "Speeding away",
                "Honking repeatedly",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What is the minimum age to hold a full driving licence in Rwanda?",
              options: ["16", "17", "18", "21"],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Night driving requires:",
              options: [
                "Faster speeds to reduce exposure",
                "Increased following distance and reduced speed",
                "High beams at all times",
                "Sunglasses",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When can you use a bus lane?",
              options: [
                "Anytime",
                "Only at off-peak hours",
                "When permitted by signs or to access a junction",
                "Never",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Skidding is most likely caused by:",
              options: [
                "Driving too slowly",
                "Sudden braking or acceleration on slippery roads",
                "Using cruise control",
                "Proper tyre pressure",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A green arrow traffic signal means:",
              options: [
                "Yield before proceeding in that direction",
                "Proceed freely in that direction",
                "Stop and wait",
                "Pedestrians have priority",
              ],
              correctAnswer: 1,
              image: null,
            },
          ],
        },
        {
          id: "exam-jun-2024",
          title: "June 2024",
          date: "June 22, 2024",
          questionCount: 20,
          difficulty: "Easy",
          tag: "Beginner Friendly",
          questions: [
            {
              topic: "Police Exam",
              question: "What does a red traffic light mean?",
              options: ["Go", "Slow down", "Stop", "Yield"],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Which side of the road do you drive on in Rwanda?",
              options: ["Left", "Right", "Either", "Middle"],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A pedestrian crossing is marked by:",
              options: [
                "Red lines",
                "Yellow dashes",
                "White stripes",
                "Blue arrows",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What must you do before reversing?",
              options: [
                "Honk once",
                "Check all mirrors and blind spots",
                "Turn on hazards",
                "Accelerate first",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What does a green traffic light mean?",
              options: [
                "Stop",
                "Proceed with caution",
                "Proceed if safe",
                "Speed up",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When should you wear a seatbelt?",
              options: [
                "On long trips only",
                "On highways only",
                "At all times",
                "When going above 60 km/h",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What is the speed limit in a school zone?",
              options: ["60 km/h", "50 km/h", "40 km/h", "30 km/h"],
              correctAnswer: 3,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "You must signal when:",
              options: [
                "Turning or changing lanes",
                "Only on highways",
                "Only in cities",
                "Only if other cars are present",
              ],
              correctAnswer: 0,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Headlights should be used:",
              options: [
                "Only in complete darkness",
                "From dusk to dawn and in low visibility",
                "Only on highways at night",
                "Whenever you feel like it",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What shape is a stop sign?",
              options: ["Triangle", "Circle", "Octagon", "Square"],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "You should check your mirrors every:",
              options: [
                "5-8 seconds",
                "30 seconds",
                "Only when turning",
                "Only when changing lanes",
              ],
              correctAnswer: 0,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Overtaking on a bend is:",
              options: [
                "Allowed if you can see ahead",
                "Allowed at low speeds",
                "Never allowed",
                "Allowed if road is wide",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When must you give way to pedestrians?",
              options: [
                "Never",
                "Only at traffic lights",
                "At all pedestrian crossings",
                "Only if they are already crossing",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "The horn should be used:",
              options: [
                "Frequently to alert others",
                "Only as a warning when necessary",
                "At intersections always",
                "To greet other drivers",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A broken white line means:",
              options: [
                "No overtaking",
                "Lane changing is permitted with care",
                "Stop ahead",
                "One way road",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Before moving off from a parked position, you should:",
              options: [
                "Just drive off",
                "Check mirrors, signal, and check blind spot",
                "Honk to warn others",
                "Only check the left mirror",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What is the purpose of anti-lock brakes (ABS)?",
              options: [
                "To brake faster",
                "To prevent wheels from locking during braking",
                "To increase fuel efficiency",
                "To reduce engine noise",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Children in the front seat must:",
              options: [
                "Sit on an adult's lap",
                "Use a booster seat or seatbelt appropriate for their size",
                "Face backwards always",
                "Have no restrictions",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "When driving in rain, you should:",
              options: [
                "Increase speed to get through faster",
                "Reduce speed and increase following distance",
                "Use full beam headlights",
                "Drive on the centerline",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A no-entry sign means:",
              options: [
                "Caution ahead",
                "You cannot enter that road",
                "Road closed temporarily",
                "One lane only",
              ],
              correctAnswer: 1,
              image: null,
            },
          ],
        },
        {
          id: "exam-feb-2024",
          title: "February 2024",
          date: "February 3, 2024",
          questionCount: 20,
          difficulty: "Hard",
          tag: null,
          questions: [
            {
              topic: "Police Exam",
              question: "Under what condition can a driver use a mobile phone?",
              options: [
                "With one hand on the wheel",
                "When stationary at traffic lights",
                "Only with a hands-free device",
                "Never under any circumstances",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What is the legal consequence of driving without insurance in Rwanda?",
              options: [
                "A verbal warning",
                "Vehicle impoundment and fine",
                "Loss of licence only",
                "No consequence",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "Lane markings that are solid white on both edges of the road indicate:",
              options: [
                "A dual carriageway",
                "The road boundaries",
                "A no-parking zone",
                "A bicycle lane",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "The 'point of no return' when approaching an amber light is:",
              options: [
                "When you are 100m away",
                "When stopping safely is no longer possible",
                "When another car is behind you",
                "After you signal",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What does a solid white line at the edge of the road indicate?",
              options: [
                "Pedestrian zone",
                "Road boundary — do not cross except in emergency",
                "Cycling lane",
                "Parking bay",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "The primary cause of accidents in urban areas is:",
              options: [
                "Mechanical failure",
                "Driver inattention and distraction",
                "Bad road conditions",
                "Poor signage",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "If a driver is involved in an accident causing injury, they must:",
              options: [
                "Leave the scene immediately",
                "Stay, assist victims, and report to police",
                "Only call a tow truck",
                "Take photos and leave",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Cruise control should NOT be used:",
              options: [
                "On long highways",
                "In wet or icy conditions",
                "At speeds above 80 km/h",
                "At night",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What is the effect of fatigue on driving?",
              options: [
                "Improves focus",
                "Slows reaction time and impairs judgment",
                "No measurable effect",
                "Only affects vision",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "Vehicles must stop for a school bus with red lights flashing within:",
              options: [
                "20 meters",
                "Any distance on the same road",
                "Only if directly behind it",
                "50 meters",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What is the legal blood alcohol limit for a professional driver in Rwanda?",
              options: ["0.08%", "0.05%", "0.00%", "0.02%"],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "What does a chevron (>>>) road marking indicate?",
              options: [
                "Reduce speed — sharp bend ahead",
                "Overtaking zone",
                "Lane merge",
                "Speed bump ahead",
              ],
              correctAnswer: 0,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Overloading a vehicle affects:",
              options: [
                "Only fuel consumption",
                "Braking distance, handling and tyre wear",
                "Only the suspension",
                "Nothing significantly",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A vehicle's registration must be renewed:",
              options: [
                "Every 5 years",
                "Only when selling the car",
                "Annually",
                "When moving to a new city",
              ],
              correctAnswer: 2,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "The minimum following distance on a highway at 100 km/h should be:",
              options: [
                "1 second",
                "2 seconds",
                "3 seconds",
                "At least 4 seconds",
              ],
              correctAnswer: 3,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What is the purpose of reflective road studs (cat's eyes)?",
              options: [
                "To indicate speed bumps",
                "To guide drivers in darkness or fog",
                "To mark parking areas",
                "Decorative only",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "Driving with a cracked windscreen is:",
              options: [
                "Acceptable if small",
                "Illegal if it obstructs the driver's view",
                "Only dangerous at night",
                "Fine if taped",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "At a T-junction, the vehicle on the minor road must:",
              options: [
                "Proceed first",
                "Yield to traffic on the major road",
                "Flash lights to signal",
                "Honk and proceed",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question:
                "What must you do when you hear a siren behind you at night?",
              options: [
                "Speed up to clear the road faster",
                "Pull over safely to the right and stop",
                "Flash hazard lights and continue",
                "Move to the left lane only",
              ],
              correctAnswer: 1,
              image: null,
            },
            {
              topic: "Police Exam",
              question: "A vehicle's speedometer must be:",
              options: [
                "Calibrated every year",
                "Accurate and functional at all times",
                "Only needed for trucks",
                "Optional for older vehicles",
              ],
              correctAnswer: 1,
              image: null,
            },
          ],
        },
      ],
    },
  ],
};

// ============================================
// STATE MANAGEMENT
// ============================================

let currentMode = "content";
let currentTopic = null;
let currentSubtopic = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartTime = null;
let quizTimeLimitMs = 0;
let timerInterval = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  injectExamSelectionStyles();
  loadContentSidebar();
  loadQuizSidebar();
  setupEventListeners();
  if (useremail) {
    const response = await FetchData("/user/profile", true);
    console.log(response);
    if (response.success) {
      useremail.textContent = response.data.data.email;
    } else {
      useremail.textContent = "Unknown User";
    }
  }
}

function injectExamSelectionStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* ── Exam Selection Screen ── */
    #examSelectionScreen {
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }

    .exam-selection-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }

    .exam-selection-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .exam-selection-title i {
      font-size: 2.2rem;
      color: #0097b2;
    }

    .exam-selection-title h1 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
    }

    .exam-selection-title p {
      color: #6b7280;
      margin: 0;
      font-size: 0.9rem;
    }

    /* ── Exam Grid ── */
    .exam-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }

    /* ── Exam Card ── */
    .exam-card {
      position: relative;
      background: #ffffff;
      border: 1.5px solid #e5e7eb;
      border-radius: 16px;
      padding: 24px 20px 20px;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .exam-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 151, 178, 0.15);
      border-color: #0097b2;
    }

    .exam-tag {
      position: absolute;
      top: 14px;
      right: 14px;
      background: #0097b2;
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .exam-card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #e0f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0097b2;
      font-size: 1.3rem;
      margin-bottom: 4px;
    }

    .exam-card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .exam-card-date {
      font-size: 0.82rem;
      color: #9ca3af;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .exam-card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 2px;
    }

    .exam-card-questions {
      font-size: 0.82rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .exam-card-difficulty {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
    }

    .exam-start-btn {
      margin-top: 6px;
      width: 100%;
      padding: 10px;
      background: #0097b2;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s ease;
    }

    .exam-start-btn:hover {
      background: #007a91;
    }

    @media (max-width: 600px) {
      .exam-grid {
        grid-template-columns: 1fr;
      }
      #examSelectionScreen {
        padding: 16px;
      }
      .exam-selection-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    /* ── Loading & empty states ── */
    .exam-loading {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px;
      color: #9ca3af;
      font-size: 1rem;
    }

    .exam-loading i {
      font-size: 2rem;
      color: #0097b2;
    }

    .exam-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px;
      color: #9ca3af;
    }

    .exam-card.loading {
      pointer-events: none;
      opacity: 0.7;
    }

    /* ── Quiz Sidebar Accordion ── */
    .quiz-topic-accordion {
      border-bottom: 1px solid #f3f4f6;
    }

    .quiz-accordion-header {
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .quiz-accordion-header:hover {
      background: #f0fdff;
    }

    .quiz-accordion-header.active {
      background: #e0f7fa;
    }

    .quiz-accordion-arrow {
      transition: transform 0.2s ease;
      color: #9ca3af;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .quiz-accordion-body {
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
      padding: 4px 0;
    }

    /* ── Subtopic row inside accordion ── */
    .quiz-subtopic-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px 8px 40px;
      gap: 8px;
      border-bottom: 1px solid #f3f4f6;
    }

    .quiz-subtopic-row:last-child {
      border-bottom: none;
    }

    .quiz-subtopic-name {
      font-size: 0.82rem;
      color: #374151;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .quiz-subtopic-name i {
      color: #0097b2;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .quiz-subtopic-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }

    .quiz-subtopic-btn {
      padding: 4px 10px;
      border: none;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.15s ease, background 0.15s ease;
      white-space: nowrap;
    }

    .quiz-subtopic-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .quiz-subtopic-btn.quiz-btn {
      background: #0097b2;
      color: #fff;
    }

    .quiz-subtopic-btn.quiz-btn:hover:not(:disabled) {
      background: #007a91;
    }

    .quiz-subtopic-btn.exercise-btn {
      background: #16a34a;
      color: #fff;
    }

    .quiz-subtopic-btn.exercise-btn:hover:not(:disabled) {
      background: #15803d;
    }

    /* ── Question nav subtopic divider ── */
    .question-nav-divider {
      grid-column: 1 / -1;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #0097b2;
      padding: 8px 2px 2px;
      border-top: 1px solid #e5e7eb;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .question-nav-divider:first-child {
      border-top: none;
      padding-top: 2px;
    }

    /* ── Question subtopic badge (shown above question text) ── */
    #questionSubtopicBadge {
      display: none;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #0097b2;
      background: #e0f7fa;
      border-radius: 999px;
      padding: 3px 10px;
      margin-left: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      vertical-align: middle;
    }

    /* ── Progress-loss warning popup ── */
    #progressWarningOverlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeInOverlay 0.18s ease;
    }
    @keyframes fadeInOverlay { from { opacity:0; } to { opacity:1; } }

    #progressWarningBox {
      background: #fff;
      border-radius: 18px;
      padding: 36px 32px 28px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      text-align: center;
      animation: slideUpBox 0.2s ease;
    }
    @keyframes slideUpBox { from { transform:translateY(24px); opacity:0; } to { transform:translateY(0); opacity:1; } }

    #progressWarningBox .pw-icon {
      font-size: 2.4rem;
      color: #f59e0b;
      margin-bottom: 12px;
    }
    #progressWarningBox h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 10px;
    }
    #progressWarningBox p {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0 0 24px;
      line-height: 1.55;
    }
    .pw-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .pw-btn {
      padding: 10px 24px;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .pw-btn:hover { opacity: 0.85; }
    .pw-btn-cancel { background: #f3f4f6; color: #374151; }
    .pw-btn-confirm { background: #dc2626; color: #fff; }

    /* ── Countdown timer ring ── */
    #quizCountdownWrap {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    #quizCountdownWrap.warning { color: #dc2626; }
    #quizCountdownWrap.caution { color: #f59e0b; }

    /* ── Review mode: read-only options ── */
    .answer-option.review-mode {
      pointer-events: none;
      cursor: default;
    }
    .answer-option.review-correct {
      background: #dcfce7 !important;
      border-color: #16a34a !important;
    }
    .answer-option.review-correct .option-letter {
      background: #16a34a !important;
      color: #fff !important;
    }
    .answer-option.review-wrong {
      background: #fee2e2 !important;
      border-color: #dc2626 !important;
    }
    .answer-option.review-wrong .option-letter {
      background: #dc2626 !important;
      color: #fff !important;
    }

    /* ── Quiz Report ── */
    #quizReportScreen {
      display: none;
      padding: 24px;
      max-width: 820px;
      margin: 0 auto;
    }
    .report-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .report-header h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .report-summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .report-stat {
      flex: 1;
      min-width: 100px;
      background: #f9fafb;
      border-radius: 12px;
      padding: 14px 18px;
      text-align: center;
      border: 1.5px solid #e5e7eb;
    }
    .report-stat .rs-val {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }
    .report-stat .rs-lbl {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 2px;
    }
    .report-question-block {
      background: #fff;
      border: 1.5px solid #e5e7eb;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 16px;
      transition: border-color 0.15s;
    }
    .report-question-block.rq-correct { border-color: #86efac; background: #f0fdf4; }
    .report-question-block.rq-wrong   { border-color: #fca5a5; background: #fff5f5; }
    .rq-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .rq-num {
      width: 28px; height: 28px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
    }
    .rq-correct .rq-num { background: #16a34a; color: #fff; }
    .rq-wrong   .rq-num { background: #dc2626; color: #fff; }
    .rq-status-icon { font-size: 1rem; }
    .rq-correct .rq-status-icon { color: #16a34a; }
    .rq-wrong   .rq-status-icon { color: #dc2626; }
    .rq-question-text {
      font-size: 0.92rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .rq-options { display: flex; flex-direction: column; gap: 6px; }
    .rq-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      border: 1.5px solid transparent;
    }
    .rq-option-letter {
      width: 24px; height: 24px;
      border-radius: 50%;
      background: #e5e7eb;
      color: #374151;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
    }
    .rq-option.rq-opt-correct {
      background: #dcfce7; border-color: #86efac;
    }
    .rq-option.rq-opt-correct .rq-option-letter {
      background: #16a34a; color: #fff;
    }
    .rq-option.rq-opt-user-wrong {
      background: #fee2e2; border-color: #fca5a5;
    }
    .rq-option.rq-opt-user-wrong .rq-option-letter {
      background: #dc2626; color: #fff;
    }
    .rq-image { max-width: 100%; border-radius: 8px; margin-bottom: 10px; }
    .report-close-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px;
      background: #0097b2; color: #fff;
      border: none; border-radius: 10px;
      font-size: 0.88rem; font-weight: 600;
      cursor: pointer; transition: background 0.15s;
    }
    .report-close-btn:hover { background: #007a91; }
    @media (max-width: 600px) {
      #quizReportScreen { padding: 12px; }
      .report-summary { gap: 10px; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// EVENT LISTENERS (replaces all inline handlers)
// ============================================

function setupEventListeners() {
    // Header: logo click
    const logoutbtn = document.getElementById("logoBtn");

    if (logoutbtn) {
      logoutbtn.addEventListener("click", async () => {
        const response = await FetchData("/logout", true);
        if (response.success) {
          localStorage.removeItem("token");
          alert("Succeessfull Logout");
          window.location.href = "../auth/login.html";
        } else {
          alert("logout failed");
        }
      });
    }


  // Header: mobile menu toggle
  document
    .getElementById("mobileMenuToggle")
    .addEventListener("click", toggleMobileMenu);

  // Topbar: sidebar toggle
  document.getElementById("menuBtn").addEventListener("click", toggleSidebar);

  // Topbar: mode buttons
  document
    .getElementById("contentModeBtn")
    .addEventListener("click", () => switchMode("content"));
  document
    .getElementById("qaModeBtn")
    .addEventListener("click", () => switchMode("qa"));

  // Overlay: close sidebar
  document.getElementById("overlay").addEventListener("click", closeSidebar);

  // Content: back button
  document.getElementById("backBtn").addEventListener("click", backToWelcome);

  // Content: bookmark & print buttons
  document
    .getElementById("bookmarkBtn")
    .addEventListener("click", bookmarkContent);
  document.getElementById("printBtn").addEventListener("click", printContent);

  // Content: submit exercise
  document
    .getElementById("submitExerciseBtn")
    .addEventListener("click", submitExercise);

  // Content: topic navigation buttons
  document.getElementById("prevTopicBtn").addEventListener("click", () => {
    // Handler is set dynamically in updateTopicNavigation; this is a fallback no-op
  });
  document.getElementById("nextTopicBtn").addEventListener("click", () => {
    // Handler is set dynamically in updateTopicNavigation; this is a fallback no-op
  });

  // Quiz: navigation buttons
  document
    .getElementById("prevBtn")
    .addEventListener("click", previousQuestion);
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);
  document.getElementById("submitBtn").addEventListener("click", submitQuiz);

  // Quiz results: action buttons
  document
    .getElementById("reviewAnswersBtn")
    .addEventListener("click", reviewAnswers);
  document
    .getElementById("retakeQuizBtn")
    .addEventListener("click", retakeQuiz);
  document
    .getElementById("backToTopicsBtn")
    .addEventListener("click", backToQuizSelection);

  document
    .getElementById("viewReportBtn")
    .addEventListener("click", showQuizReport);
}

// ============================================
// CONTENT MODE FUNCTIONS
// ============================================

function loadContentSidebar() {
  const topicsNav = document.getElementById("topicsNav");
  topicsNav.innerHTML = "";

  CONTENT_DATA.topics.forEach((topic) => {
    const topicDiv = document.createElement("div");
    topicDiv.className = "topic";

    const subtopicsHTML = topic.subtopics
      .map(
        (subtopic) => `
          <a href="#" class="subtopic-link" data-topic="${topic.id}" data-subtopic="${subtopic.id}">
            <i class="fas fa-file-alt"></i> ${subtopic.title}
          </a>
        `,
      )
      .join("");

    topicDiv.innerHTML = `
      <div class="topic-header">
        <span>${topic.title}</span>
        <span class="topic-icon"><i class="fas fa-chevron-right"></i></span>
      </div>
      <div class="subtopics">
        ${subtopicsHTML}
      </div>
    `;

    topicsNav.appendChild(topicDiv);
  });

  // Attach topic header toggle listeners
  topicsNav.querySelectorAll(".topic-header").forEach((header) => {
    header.addEventListener("click", () => toggleTopic(header));
  });

  // Attach subtopic link listeners
  topicsNav.querySelectorAll(".subtopic-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      loadContent(e, link.dataset.topic, link.dataset.subtopic);
    });
  });
}

function toggleTopic(element) {
  const topic = element.parentElement;
  const subtopics = topic.querySelector(".subtopics");
  const isActive = element.classList.contains("active");

  document
    .querySelectorAll(".topic-header")
    .forEach((header) => header.classList.remove("active"));
  document
    .querySelectorAll(".subtopics")
    .forEach((sub) => sub.classList.remove("open"));

  if (!isActive) {
    element.classList.add("active");
    subtopics.classList.add("open");
  }
}

function loadContent(event, topicId, subtopicId) {
  event.preventDefault();

  document
    .querySelectorAll(".subtopic-link")
    .forEach((link) => link.classList.remove("active"));
  event.target.closest(".subtopic-link").classList.add("active");

  const topic = CONTENT_DATA.topics.find((t) => t.id === topicId);
  const subtopic = topic.subtopics.find((s) => s.id === subtopicId);

  currentTopic = topic;
  currentSubtopic = subtopic;

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("contentDisplay").style.display = "block";
  document.getElementById("contentTitle").textContent = subtopic.title;

  renderContent(subtopic);

  if (subtopic.exercise) {
    renderExercise(subtopic.exercise);
  } else {
    document.getElementById("exerciseSection").style.display = "none";
  }

  updateTopicNavigation(topic, subtopic);
  closeSidebar();
}

function renderContent(subtopic) {
  const container = document.getElementById("contentContainer");
  container.innerHTML = "";

  switch (subtopic.formatType) {
    case "flip_card":
      container.innerHTML = renderFlipCards(subtopic.content.cards);
      break;
    case "image_right":
      container.innerHTML = renderImageRight(subtopic.content);
      break;
    case "image_left":
      container.innerHTML = renderImageLeft(subtopic.content);
      break;
    case "image_overlay":
      container.innerHTML = renderImageOverlay(subtopic.content);
      break;
    case "accordion":
      container.innerHTML = renderAccordion(subtopic.content.sections);
      break;
    case "tabs":
      container.innerHTML = renderTabs(subtopic.content.tabs);
      break;
    case "timeline":
      container.innerHTML = renderTimeline(subtopic.content.steps);
      break;
  }

  initializeFormatInteractions();
}

// ===== FORMAT RENDERERS =====

function renderFlipCards(cards) {
  return `
    <div class="format-flip-cards">
      ${cards
        .map(
          (card) => `
        <div class="flip-card">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <img src="${card.image}" alt="${card.title}">
              <h4>${card.title}</h4>
            </div>
            <div class="flip-card-back">
              <p>${card.description}</p>
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderImageRight(content) {
  return `
    <div class="format-image-right">
      <div class="text-content">
        <h3>${content.title}</h3>
        ${content.text.map((p) => `<p>${p}</p>`).join("")}
      </div>
      <div class="image-content">
        <img src="${content.image}" alt="${content.title}">
      </div>
    </div>
  `;
}

function renderImageLeft(content) {
  return `
    <div class="format-image-left">
      <div class="image-content">
        <img src="${content.image}" alt="${content.title}">
      </div>
      <div class="text-content">
        <h3>${content.title}</h3>
        ${content.text.map((p) => `<p>${p}</p>`).join("")}
      </div>
    </div>
  `;
}

function renderImageOverlay(content) {
  return `
    <div class="format-image-overlay">
      <img src="${content.image}" alt="${content.title}">
      <div class="overlay-content">
        <h3>${content.title}</h3>
        <p>${content.description}</p>
      </div>
    </div>
  `;
}

function renderAccordion(sections) {
  return `
    <div class="format-accordion">
      ${sections
        .map(
          (section, index) => `
        <div class="accordion-item ${index === 0 ? "active" : ""}">
          <div class="accordion-header">
            <h4>${section.title}</h4>
            <i class="fas fa-chevron-down accordion-icon"></i>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <p>${section.text}</p>
              ${section.image ? `<img src="${section.image}" alt="${section.title}">` : ""}
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderTabs(tabs) {
  return `
    <div class="format-tabs">
      <div class="tab-headers">
        ${tabs
          .map(
            (tab, index) => `
          <button class="tab-header ${index === 0 ? "active" : ""}" data-tab-index="${index}">
            ${tab.title}
          </button>
        `,
          )
          .join("")}
      </div>
      ${tabs
        .map(
          (tab, index) => `
        <div class="tab-content ${index === 0 ? "active" : ""}" id="tab-${index}">
          <div class="tab-body">
            <h4>${tab.title}</h4>
            <p>${tab.content}</p>
            ${tab.image ? `<img src="${tab.image}" alt="${tab.title}">` : ""}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderTimeline(steps) {
  return `
    <div class="format-timeline">
      ${steps
        .map(
          (step, index) => `
        <div class="timeline-item">
          <div class="timeline-number">${index + 1}</div>
          <div class="timeline-content">
            <h4>${step.title}</h4>
            <p>${step.description}</p>
            ${step.image ? `<img src="${step.image}" alt="${step.title}">` : ""}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

// ===== FORMAT INTERACTIONS =====

function flipCard(card) {
  card.classList.toggle("flipped");
}

function toggleAccordion(header) {
  const item = header.parentElement;
  const wasActive = item.classList.contains("active");

  document
    .querySelectorAll(".accordion-item")
    .forEach((i) => i.classList.remove("active"));

  if (!wasActive) {
    item.classList.add("active");
  }
}

function switchTab(button, index) {
  document
    .querySelectorAll(".tab-header")
    .forEach((h) => h.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));

  button.classList.add("active");
  document.getElementById(`tab-${index}`).classList.add("active");
}

function initializeFormatInteractions() {
  // Flip cards
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => flipCard(card));
  });

  // Accordion headers
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => toggleAccordion(header));
  });

  // Tab headers
  document.querySelectorAll(".tab-header").forEach((button) => {
    button.addEventListener("click", () =>
      switchTab(button, parseInt(button.dataset.tabIndex)),
    );
  });

  // Ensure first accordion item is active
  const firstAccordion = document.querySelector(".accordion-item");
  if (firstAccordion) {
    firstAccordion.classList.add("active");
  }
}

// ===== EXERCISE FUNCTIONS =====

function renderExercise(exercise) {
  const exerciseSection = document.getElementById("exerciseSection");
  const exerciseQuestions = document.getElementById("exerciseQuestions");

  exerciseQuestions.innerHTML = exercise.questions
    .map(
      (q, index) => `
        <div class="exercise-question">
          <div class="exercise-question-text">${index + 1}. ${q.question}</div>
          <div class="exercise-options">
            ${q.options
              .map(
                (option, optIndex) => `
              <div class="exercise-option">
                <input type="radio" name="exercise-${index}" id="exercise-${index}-${optIndex}" value="${optIndex}">
                <label for="exercise-${index}-${optIndex}">${option}</label>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");

  exerciseSection.style.display = "block";
  document.getElementById("exerciseResults").style.display = "none";
}

function submitExercise() {
  const exercise = currentSubtopic.exercise;
  let correctCount = 0;

  exercise.questions.forEach((q, index) => {
    const selected = document.querySelector(
      `input[name="exercise-${index}"]:checked`,
    );
    const options = document.querySelectorAll(
      `input[name="exercise-${index}"]`,
    );

    options.forEach((opt, optIndex) => {
      const parent = opt.parentElement;
      parent.classList.remove("correct", "incorrect");

      if (optIndex === q.correctAnswer) {
        parent.classList.add("correct");
      }

      if (
        selected &&
        parseInt(selected.value) === optIndex &&
        optIndex !== q.correctAnswer
      ) {
        parent.classList.add("incorrect");
      }
    });

    if (selected && parseInt(selected.value) === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round(
    (correctCount / exercise.questions.length) * 100,
  );
  const resultsDiv = document.getElementById("exerciseResults");

  resultsDiv.innerHTML = `
    <h4>Exercise Results</h4>
    <div class="exercise-score">${percentage}%</div>
    <p>You got ${correctCount} out of ${exercise.questions.length} questions correct!</p>
    ${
      percentage >= 80
        ? '<p style="color: var(--success); font-weight: 600;">Great job! You\'ve mastered this topic.</p>'
        : '<p style="color: var(--warning); font-weight: 600;">Keep practicing to improve your understanding.</p>'
    }
  `;

  resultsDiv.style.display = "block";
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ===== TOPIC NAVIGATION =====

function updateTopicNavigation(topic, subtopic) {
  const prevBtn = document.getElementById("prevTopicBtn");
  const nextBtn = document.getElementById("nextTopicBtn");

  const topicIndex = CONTENT_DATA.topics.findIndex((t) => t.id === topic.id);
  const subtopicIndex = topic.subtopics.findIndex((s) => s.id === subtopic.id);

  // Previous button
  prevBtn.replaceWith(prevBtn.cloneNode(true)); // Remove old listeners
  const newPrevBtn = document.getElementById("prevTopicBtn");

  if (subtopicIndex > 0) {
    newPrevBtn.style.display = "flex";
    newPrevBtn.addEventListener("click", () => {
      loadContentDirect(topic.id, topic.subtopics[subtopicIndex - 1].id);
    });
  } else if (topicIndex > 0) {
    const prevTopic = CONTENT_DATA.topics[topicIndex - 1];
    const lastSubtopic = prevTopic.subtopics[prevTopic.subtopics.length - 1];
    newPrevBtn.style.display = "flex";
    newPrevBtn.addEventListener("click", () =>
      loadContentDirect(prevTopic.id, lastSubtopic.id),
    );
  } else {
    newPrevBtn.style.display = "none";
  }

  // Next button
  nextBtn.replaceWith(nextBtn.cloneNode(true)); // Remove old listeners
  const newNextBtn = document.getElementById("nextTopicBtn");

  if (subtopicIndex < topic.subtopics.length - 1) {
    newNextBtn.style.display = "flex";
    newNextBtn.addEventListener("click", () => {
      loadContentDirect(topic.id, topic.subtopics[subtopicIndex + 1].id);
    });
  } else if (topicIndex < CONTENT_DATA.topics.length - 1) {
    const nextTopic = CONTENT_DATA.topics[topicIndex + 1];
    const firstSubtopic = nextTopic.subtopics[0];
    newNextBtn.style.display = "flex";
    newNextBtn.addEventListener("click", () =>
      loadContentDirect(nextTopic.id, firstSubtopic.id),
    );
  } else {
    newNextBtn.style.display = "none";
  }
}

function loadContentDirect(topicId, subtopicId) {
  const topicHeader = Array.from(
    document.querySelectorAll(".topic-header"),
  ).find((header) =>
    header.textContent.includes(
      CONTENT_DATA.topics.find((t) => t.id === topicId).title,
    ),
  );

  if (topicHeader && !topicHeader.classList.contains("active")) {
    toggleTopic(topicHeader);
  }

  const subtopicLink = document.querySelector(
    `.subtopic-link[data-topic="${topicId}"][data-subtopic="${subtopicId}"]`,
  );
  if (subtopicLink) {
    subtopicLink.click();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================
// QUIZ MODE FUNCTIONS
// ============================================

// Maps topic names to Font Awesome icons for the sidebar
const TOPIC_ICON_MAP = {
  default: "fas fa-book",
  overview: "fas fa-map",
  "traffic signs": "fas fa-traffic-light",
  "road rules": "fas fa-road",
  technology: "fas fa-microchip",
  physics: "fas fa-atom",
  mathematics: "fas fa-calculator",
  science: "fas fa-flask",
  history: "fas fa-landmark",
  geography: "fas fa-globe",
  biology: "fas fa-dna",
  chemistry: "fas fa-vial",
  english: "fas fa-book-open",
};

function getTopicIcon(topicName) {
  const key = (topicName || "").toLowerCase();
  return TOPIC_ICON_MAP[key] || TOPIC_ICON_MAP.default;
}

/**
 * Loads the quiz sidebar.
 * - Always pins "Latest Police Exam" (multi-session) at the top.
 * - Fetches topics from GET /topics and renders each as an accordion.
 *   Each accordion header = topic name.
 *   Each accordion body = one subtopic link per subtopic → clicking launches quiz immediately.
 *   If a topic has no subtopics, the header itself launches the quiz directly.
 * Falls back to static QUIZ_DATA when the backend is unreachable.
 */
async function loadQuizSidebar() {
  const quizNav = document.getElementById("quizTopicsNav");
  quizNav.innerHTML = "";

  // 1a. Always pin the Overview (mixed) quiz at the very top — GET /quiz/random
  _appendQuizNavItem(quizNav, {
    icon: "fas fa-map",
    title: "Overview",
    subLabel: "Mixed questions — all topics",
    onClick: () => confirmQuizNavigation(() => fetchAndStartOverviewQuiz()),
  });

  // 1b. Always pin the multi-session Police Exam below Overview
  const policeExamEntry = QUIZ_DATA.quizzes.find((q) => q.isMultiSession);
  if (policeExamEntry) {
    _appendQuizNavItem(quizNav, {
      icon: policeExamEntry.icon,
      title: policeExamEntry.title,
      subLabel: `${policeExamEntry.sessions.length} Exam Sessions`,
      onClick: () => showExamSelectionScreen(policeExamEntry),
    });
  }

  // 2. Fetch topics from backend
  try {
    const response = await FetchData("/topic", true);
    const topics = response?.data?.topics ?? [];
    console.log("Fetched topics from backend:", topics);

    if (topics.length === 0) {
      // Fallback to static QUIZ_DATA (excluding the already-pinned multi-session entry)
      QUIZ_DATA.quizzes
        .filter((q) => !q.isMultiSession)
        .forEach((quiz) => {
          _appendQuizNavItem(quizNav, {
            icon: quiz.icon,
            title: quiz.title,
            subLabel: `${quiz.questionCount} Questions`,
            onClick: () => startQuiz(quiz.id),
          });
        });
      return;
    }

    // Render each backend topic — clicking launches the quiz immediately
    topics.forEach((topic) => {
      const topicName = topic.name ?? topic.title ?? "Topic";
      const icon = getTopicIcon(topicName);

      _appendQuizNavItem(quizNav, {
        icon,
        title: topicName,
        subLabel: "Quiz available",
        onClick: () =>
          confirmQuizNavigation(() => fetchAndStartTopicQuiz(topicName)),
      });
    });
  } catch (err) {
    console.warn("Could not load topics from backend, using local data:", err);
    QUIZ_DATA.quizzes
      .filter((q) => !q.isMultiSession)
      .forEach((quiz) => {
        _appendQuizNavItem(quizNav, {
          icon: quiz.icon,
          title: quiz.title,
          subLabel: `${quiz.questionCount} Questions`,
          onClick: () => startQuiz(quiz.id),
        });
      });
  }
}

/** Internal helper — builds and appends a single quiz nav item. */
function _appendQuizNavItem(container, { icon, title, subLabel, onClick }) {
  const div = document.createElement("div");
  div.className = "quiz-topic-item";
  div.innerHTML = `
    <div class="quiz-topic-icon"><i class="${icon}"></i></div>
    <div class="quiz-topic-info">
      <h4>${title}</h4>
      <p>${subLabel}</p>
    </div>
    <i class="fas fa-chevron-right"></i>
  `;
  div.addEventListener("click", onClick);
  container.appendChild(div);
}

// ============================================
// TOPIC QUIZ OPTIONS SCREEN
// ============================================

/**
 * Shows an inline options screen (Quiz / Exercise) for a given backend topic.
 * Clicking Quiz → GET /quiz/random?topic=<name>
 * Clicking Exercise → GET /quiz/random?topic=<name>&mode=exercise
 *
 * If the topic has subtopics, each subtopic is listed with its own
 * Quiz / Exercise buttons.
 */
function showTopicQuizOptions(topic) {
  const topicName = topic.name ?? topic.title ?? "Topic";
  const subtopics = topic.subtopics ?? [];

  // Hide other screens
  document.getElementById("quizStartScreen").style.display = "none";
  document.getElementById("quizInterface").style.display = "none";
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("examSelectionScreen").style.display = "none";

  // Reuse examSelectionScreen container — it already has the right layout
  const screen = document.getElementById("examSelectionScreen");
  screen.style.display = "block";

  const icon = getTopicIcon(topicName);

  // Build subtopic rows if present, otherwise just top-level buttons
  const subtopicRows =
    subtopics.length > 0
      ? subtopics
          .map((sub) => {
            const subName = sub.name ?? sub.title ?? "Subtopic";
            return `
          <div class="exam-card" data-subtopic="${subName}">
            <div class="exam-card-icon"><i class="fas fa-layer-group"></i></div>
            <h3 class="exam-card-title">${subName}</h3>
            <p class="exam-card-date"><i class="fas fa-tag"></i> ${topicName}</p>
            <div class="exam-card-meta" style="gap:8px; flex-wrap:wrap;">
              <button class="exam-start-btn topic-quiz-btn"
                data-topic="${topicName}" data-subtopic="${subName}" data-mode="quiz"
                style="flex:1; min-width:100px;">
                <i class="fas fa-question-circle"></i> Quiz
              </button>
              <button class="exam-start-btn topic-quiz-btn"
                data-topic="${topicName}" data-subtopic="${subName}" data-mode="exercise"
                style="flex:1; min-width:100px; background:#16a34a;">
                <i class="fas fa-pencil-alt"></i> Exercise
              </button>
            </div>
          </div>`;
          })
          .join("")
      : `
      <div class="exam-card" style="grid-column: 1/-1; max-width: 380px; margin: 0 auto;">
        <div class="exam-card-icon"><i class="${icon}"></i></div>
        <h3 class="exam-card-title">${topicName}</h3>
        <div class="exam-card-meta" style="gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="exam-start-btn topic-quiz-btn"
            data-topic="${topicName}" data-mode="quiz"
            style="flex:1; min-width:120px;">
            <i class="fas fa-question-circle"></i> Start Quiz
          </button>
          <button class="exam-start-btn topic-quiz-btn"
            data-topic="${topicName}" data-mode="exercise"
            style="flex:1; min-width:120px; background:#16a34a;">
            <i class="fas fa-pencil-alt"></i> Exercise
          </button>
        </div>
      </div>`;

  screen.innerHTML = `
    <div id="topicQuizOptionsInner" style="padding:24px; max-width:960px; margin:0 auto;">
      <div class="exam-selection-header">
        <button id="backToQuizTopicsBtn" class="exam-start-btn"
          style="width:auto; padding:8px 16px; background:#6b7280;">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <div class="exam-selection-title">
          <i class="${icon}"></i>
          <div>
            <h1>${topicName}</h1>
            <p>Choose a mode to start</p>
          </div>
        </div>
      </div>
      <div class="exam-grid">${subtopicRows}</div>
    </div>
  `;

  // Back button
  screen
    .querySelector("#backToQuizTopicsBtn")
    .addEventListener("click", hideExamSelectionScreen);

  // Quiz / Exercise buttons
  screen.querySelectorAll(".topic-quiz-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const t = btn.dataset.topic;
      const sub = btn.dataset.subtopic ?? null;
      const mode = btn.dataset.mode; // "quiz" | "exercise"

      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
      btn.disabled = true;

      try {
        await fetchAndStartTopicQuiz(t, mode, sub);
      } catch (err) {
        console.error("Failed to start topic quiz:", err);
        btn.innerHTML =
          mode === "exercise"
            ? `<i class="fas fa-pencil-alt"></i> Exercise`
            : `<i class="fas fa-question-circle"></i> ${sub ? "Quiz" : "Start Quiz"}`;
        btn.disabled = false;
      }
    });
  });

  closeSidebar();
}

// ============================================
// BACKEND TOPIC QUIZ FETCHER
// ============================================

/**
 * Fetches a random quiz from the backend using:
 *   GET /quiz/random?topic=<topic>[&subtopic=<subtopic>][&mode=exercise]
 *
 * The backend is expected to return:
 * {
 *   success: true,
 *   data: {
 *     quiz_id: "...",        // optional — may be absent for random quizzes
 *     title: "...",          // optional
 *     questions: [           // array of question objects (same shape as /question/:id response)
 *       { question_id, statement, options: {A,B,C,D}, correctAnswerId, ... }
 *     ]
 *   }
 * }
 *
 * @param {string} topicName  - e.g. "Technology" or "Traffic Signs"
 * @param {string} mode       - "quiz" (default) or "exercise"
 * @param {string|null} subtopic - optional subtopic name e.g. "Physics"
 */
// Fetches a mixed quiz with no topic filter — GET /quiz/random
async function fetchAndStartOverviewQuiz() {
  console.log("Fetching overview quiz: /quiz/random");

  const response = await FetchData("/quiz/random", true);

  if (!response?.success) {
    throw new Error(response?.error ?? "Backend returned an error");
  }

  const questionIds = response.data?.questions ?? [];

  if (questionIds.length === 0) {
    showInfoPopup(
      "No questions available",
      "The overview quiz has no questions right now. Please try again later.",
      "fas fa-inbox",
      "#f59e0b",
    );
    return;
  }

  const results = await Promise.allSettled(
    questionIds.map((id) => FetchData(`/question/${id}`, true)),
  );

  const questions = results
    .filter((r) => r.status === "fulfilled" && r.value?.success !== false)
    .map((r) => normalizeQuestion(r.value.data.question));

  const failCount = results.length - questions.length;
  if (failCount > 0)
    console.warn(`${failCount} question(s) failed to load and were skipped.`);

  if (questions.length === 0) {
    showInfoPopup(
      "No questions available",
      "The overview quiz has no questions right now. Please try again later.",
      "fas fa-inbox",
      "#f59e0b",
    );
    return;
  }

  currentSessionMeta = {
    quiz_id: "overview",
    title: "Overview Quiz",
    topicName: null,
  };
  launchQuiz("overview", "Overview Quiz", questions);
}

async function fetchAndStartTopicQuiz(topicName) {
  const endpoint = `/quiz/random?topic=${encodeURIComponent(topicName)}`;
  console.log(`Fetching topic quiz: ${endpoint}`);

  const response = await FetchData(endpoint, true);

  if (!response?.success) {
    throw new Error(response?.error ?? "Backend returned an error");
  }

  // Backend returns questions as plain IDs e.g. [42, 41, 43]
  // Fetch each question individually, same as the Police Exam loader
  const questionIds = response.data?.questions ?? [];

  if (questionIds.length === 0) {
    showInfoPopup(
      "No questions available",
      `There are no questions available for <strong>${topicName}</strong> right now. Please try another topic or check back later.`,
      "fas fa-inbox",
      "#f59e0b",
    );
    return;
  }

  const results = await Promise.allSettled(
    questionIds.map((id) => FetchData(`/question/${id}`, true)),
  );

  const questions = results
    .filter((r) => r.status === "fulfilled" && r.value?.success !== false)
    .map((r) => normalizeQuestion(r.value.data.question));

  const failCount = results.length - questions.length;
  if (failCount > 0)
    console.warn(`${failCount} question(s) failed to load and were skipped.`);

  if (questions.length === 0) {
    showInfoPopup(
      "No questions available",
      `There are no questions available for <strong>${topicName}</strong> right now. Please try another topic or check back later.`,
      "fas fa-inbox",
      "#f59e0b",
    );
    return;
  }

  currentSessionMeta = {
    quiz_id: `topic-${topicName}`,
    title: `${topicName} Quiz`,
    topicName,
  };
  launchQuiz(`topic-${topicName}`, `${topicName} Quiz`, questions);
}

// ============================================
// EXAM SELECTION SCREEN (multi-session quizzes)
// ============================================

const DIFFICULTY_COLORS = {
  Easy: { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
  Medium: { bg: "#fef9c3", text: "#ca8a04", border: "#fde047" },
  Hard: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
};

// Keeps track of which backend quiz session is active (for retake/back navigation)
let currentSessionMeta = null; // { quiz_id, title }

function formatUserDate(isoString) {
  const date = new Date(isoString);
  return date
    .toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" at", "");
}

async function showExamSelectionScreen(quiz) {
  // Hide other screens
  document.getElementById("quizStartScreen").style.display = "none";
  document.getElementById("quizInterface").style.display = "none";
  document.getElementById("quizResults").style.display = "none";

  const screen = document.getElementById("examSelectionScreen");
  screen.style.display = "block";

  // Always rebuild the Police Exam selection HTML structure
  // (showTopicQuizOptions may have overwritten it with its own layout)
  screen.innerHTML = `
    <div style="padding:24px; max-width:960px; margin:0 auto;">
      <div class="exam-selection-header">
        <button id="backToQuizTopicsBtn" class="exam-start-btn"
          style="width:auto; padding:8px 16px; background:#6b7280;">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <div class="exam-selection-title">
          <i class="fas fa-certificate"></i>
          <div>
            <h1>${quiz.title ?? "Police Exams"}</h1>
            <p>Select an exam session to begin</p>
          </div>
        </div>
      </div>
      <div class="exam-grid" id="examGrid">
        <div class="exam-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading exams...</p>
        </div>
      </div>
    </div>
  `;

  // Back button
  screen
    .querySelector("#backToQuizTopicsBtn")
    .addEventListener("click", hideExamSelectionScreen);

  const grid = screen.querySelector("#examGrid");

  try {
    const response = await FetchData("/quizzes", true);
    const sessions = response.data.quizzes;

    if (!sessions || sessions.length === 0) {
      grid.innerHTML = `<p class="exam-empty">No exams available yet. Check back later.</p>`;
      return;
    }

    grid.innerHTML = "";

    sessions.forEach((session) => {
      const card = document.createElement("div");
      card.className = "exam-card";
      card.dataset.sessionId = session.quiz_id;
      card.dataset.sessionTitle = session.title;

      card.innerHTML = `
        <div class="exam-card-icon"><i class="fas fa-file-alt"></i></div>
        <h3 class="exam-card-title">${session.title}</h3>
        <p class="exam-card-date"><i class="fas fa-calendar-alt"></i> ${formatUserDate(session.publish_date)}</p>
        <div class="exam-card-meta">
          <span class="exam-card-questions">
            <i class="fas fa-list-ol"></i> ${session.questions.length} Questions
          </span>
        </div>
        <button class="exam-start-btn">Start Exam <i class="fas fa-arrow-right"></i></button>
      `;

      card.addEventListener("click", async () => {
        if (card.classList.contains("loading")) return;
        card.classList.add("loading");

        const btn = card.querySelector(".exam-start-btn");
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
        btn.disabled = true;

        confirmQuizNavigation(async () => {
          try {
            await loadAndStartQuiz(
              session.quiz_id,
              session.title,
              session.questions,
            );
          } catch (err) {
            console.error("Failed to start exam:", err);
            btn.innerHTML = `Start Exam <i class="fas fa-arrow-right"></i>`;
            btn.disabled = false;
            card.classList.remove("loading");
          }
        });
      });

      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load exams:", err);
    grid.innerHTML = `<p class="exam-empty">Failed to load exams. Please try again.</p>`;
  }

  closeSidebar();
}

// ============================================
// FIX 1: normalizeQuestion
// ============================================
// The backend returns each question with:
//   - options: { A: {id, text}, B: {id, text}, C: {id, text}, D: {id, text} }
//   - correctAnswerId: a numeric answer option ID (e.g. 38)
//
// We match correctAnswerId against each option's id to derive the 0-based index.
// If options are plain strings (legacy local data), we fall back gracefully.
function normalizeQuestion(raw) {
  const optionKeys = ["A", "B", "C", "D"];

  // Build the options text array and collect each option's id for matching
  const optionIds = [];
  const options = optionKeys.map((key) => {
    const opt = raw.options?.[key];
    if (opt && typeof opt === "object") {
      optionIds.push(opt.id); // store numeric id for correct-answer lookup
      return opt.text ?? "";
    }
    // Fallback: options are plain strings (e.g. local QUIZ_DATA)
    optionIds.push(null);
    return opt ?? "";
  });

  // Derive correctAnswer index:
  // 1. Try matching correctAnswerId against option ids (backend data)
  // 2. Fall back to letter-based mapping "A"→0 (if backend sends a letter)
  // 3. Fall back to the raw numeric value (local QUIZ_DATA already uses 0-based index)
  let correctAnswer = 0;
  if (raw.correctAnswerId != null && optionIds.some((id) => id != null)) {
    const matchedIndex = optionIds.indexOf(raw.correctAnswerId);
    if (matchedIndex !== -1) {
      correctAnswer = matchedIndex;
    }
  } else if (
    typeof raw.correctAnswer === "string" &&
    raw.correctAnswer.length === 1
  ) {
    // Letter mapping: "A"→0, "B"→1, etc.
    const letterMap = { A: 0, B: 1, C: 2, D: 3 };
    correctAnswer = letterMap[raw.correctAnswer.toUpperCase()] ?? 0;
  } else if (typeof raw.correctAnswer === "number") {
    correctAnswer = raw.correctAnswer;
  }

  // Build image data URI from base64 if provided by the backend
  const image =
    raw.image && raw.mimetype
      ? `data:${raw.mimetype};base64,${raw.image}`
      : null;

  return {
    topic: raw.topic ?? raw.topicName ?? raw.topic_name ?? "Quiz",
    subtopic: raw.subtopic ?? raw.subtopicName ?? raw.subtopic_name ?? null,
    question: raw.statement ?? raw.question ?? "",
    options,
    correctAnswer,
    image,
  };
}

// ============================================
// FIX 2: loadAndStartQuiz
// ============================================
// The questionIds array from the backend is actually an array of question
// objects: [{question_id, correctAnswerId, statement, topicId}, ...].
// We must extract .question_id from each object, not stringify the object itself.
async function loadAndStartQuiz(quizId, quizTitle, questionObjects) {
  console.log(`Loading questions for quiz ${quizId}:`, questionObjects);

  const results = await Promise.allSettled(
    // FIX: use q.question_id instead of passing the whole object as the URL param
    questionObjects.map((q) => FetchData(`/question/${q.question_id}`, true)),
  );

  console.log("Question fetch results:", results);

  const questions = results
    .filter((r) => r.status === "fulfilled" && r.value?.success !== false)
    .map((r) => normalizeQuestion(r.value.data.question));

  if (questions.length === 0) {
    showInfoPopup(
      "No questions available",
      "This exam has no questions that could be loaded. Please try another session.",
      "fas fa-inbox",
      "#f59e0b",
    );
    throw new Error("No questions could be loaded for this exam.");
  }

  // Log any individual failures so they're easy to spot during development
  const failCount = results.length - questions.length;
  if (failCount > 0) {
    console.warn(`${failCount} question(s) failed to load and were skipped.`);
  }

  // Store session meta so retake/back can reference it
  currentSessionMeta = { quiz_id: quizId, title: quizTitle };

  // Hand off to the quiz engine
  launchQuiz(quizId, quizTitle, questions);
}

// ============================================
// PROGRESS WARNING POPUP
// ============================================

/**
 * If a quiz is currently in progress (questions answered > 0),
 * shows a confirmation popup before running onConfirm.
 * If no quiz is in progress, calls onConfirm immediately.
 */
function confirmQuizNavigation(onConfirm) {
  // Quiz is "in progress" when the quiz interface is visible AND we are not
  // in review mode (results screen counts as done, not in-progress).
  const quizInterfaceVisible =
    document.getElementById("quizInterface")?.style.display !== "none";
  const inProgress =
    currentQuiz && quizInterfaceVisible && currentQuiz.reviewMode !== true;

  if (!inProgress) {
    onConfirm();
    return;
  }

  const answered = userAnswers.filter((a) => a !== null).length;
  const total = currentQuiz.questions.length;

  const overlay = document.createElement("div");
  overlay.id = "progressWarningOverlay";
  overlay.innerHTML = `
    <div id="progressWarningBox">
      <div class="pw-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <h3>Quiz in progress!</h3>
      <p>You have answered <strong>${answered}</strong> of <strong>${total}</strong> questions.<br>
        Leaving now will lose all your progress.</p>
      <div class="pw-actions">
        <button class="pw-btn pw-btn-cancel">Keep going</button>
        <button class="pw-btn pw-btn-confirm">Yes, leave</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".pw-btn-cancel").addEventListener("click", () => {
    overlay.remove();
  });
  overlay.querySelector(".pw-btn-confirm").addEventListener("click", () => {
    overlay.remove();
    clearInterval(timerInterval);
    onConfirm();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// Shows a simple info/error popup — used for empty question sets and other user-facing errors
function showInfoPopup(
  title,
  message,
  icon = "fas fa-info-circle",
  iconColor = "#0097b2",
) {
  // Remove any existing popup first
  document.getElementById("progressWarningOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "progressWarningOverlay";
  overlay.innerHTML = `
    <div id="progressWarningBox">
      <div class="pw-icon" style="color:${iconColor}"><i class="${icon}"></i></div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="pw-actions">
        <button class="pw-btn pw-btn-cancel" style="background:#0097b2;color:#fff;">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay
    .querySelector(".pw-btn-cancel")
    .addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ============================================
// QUIZ REPORT
// ============================================

function buildQuizReport(
  correctCount,
  incorrectCount,
  percentage,
  minutes,
  seconds,
) {
  const reportScreen = document.getElementById("quizReportScreen");
  reportScreen.style.display = "none";

  const totalQ = currentQuiz.questions.length;
  const letters = ["A", "B", "C", "D"];

  const questionsHTML = currentQuiz.questions
    .map((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isCorrect = userAnswer === q.correctAnswer;
      const blockClass = isCorrect ? "rq-correct" : "rq-wrong";
      const icon = isCorrect
        ? `<i class="fas fa-check-circle rq-status-icon"></i>`
        : `<i class="fas fa-times-circle rq-status-icon"></i>`;

      const optionsHTML = q.options
        .map((opt, oi) => {
          const isCorrectOpt = oi === q.correctAnswer;
          const isUserWrong = oi === userAnswer && !isCorrectOpt;
          let optClass = "";
          if (isCorrectOpt) optClass = " rq-opt-correct";
          else if (isUserWrong) optClass = " rq-opt-user-wrong";
          return `
        <div class="rq-option${optClass}">
          <span class="rq-option-letter">${letters[oi]}</span>
          <span>${opt}</span>
          ${isCorrectOpt ? '<span style="margin-left:auto;font-size:0.75rem;color:#16a34a;font-weight:700;">✓ Correct</span>' : ""}
          ${isUserWrong ? '<span style="margin-left:auto;font-size:0.75rem;color:#dc2626;font-weight:700;">✗ Your answer</span>' : ""}
        </div>`;
        })
        .join("");

      return `
      <div class="report-question-block ${blockClass}">
        <div class="rq-meta">
          <div class="rq-num">${idx + 1}</div>
          ${icon}
          <span style="font-size:0.78rem;color:#6b7280;">${q.topic ?? ""}</span>
        </div>
        ${q.image ? `<img class="rq-image" src="${q.image}" alt="question image">` : ""}
        <div class="rq-question-text">${q.question}</div>
        <div class="rq-options">${optionsHTML}</div>
      </div>`;
    })
    .join("");

  reportScreen.innerHTML = `
    <div class="report-header">
      <h2><i class="fas fa-clipboard-list" style="color:#0097b2;margin-right:8px;"></i>Quiz Report — ${currentQuiz.title}</h2>
      <button class="report-close-btn" id="closeReportBtn">
        <i class="fas fa-arrow-left"></i> Back to Results
      </button>
    </div>
    <div class="report-summary">
      <div class="report-stat">
        <div class="rs-val" style="color:#0097b2;">${percentage}%</div>
        <div class="rs-lbl">Score</div>
      </div>
      <div class="report-stat">
        <div class="rs-val" style="color:#16a34a;">${correctCount}</div>
        <div class="rs-lbl">Correct</div>
      </div>
      <div class="report-stat">
        <div class="rs-val" style="color:#dc2626;">${incorrectCount}</div>
        <div class="rs-lbl">Wrong</div>
      </div>
      <div class="report-stat">
        <div class="rs-val">${totalQ}</div>
        <div class="rs-lbl">Total</div>
      </div>
      <div class="report-stat">
        <div class="rs-val">${minutes}:${String(seconds).padStart(2, "0")}</div>
        <div class="rs-lbl">Time taken</div>
      </div>
    </div>
    ${questionsHTML}
    <div style="text-align:center;margin-top:24px;">
      <button class="report-close-btn" id="closeReportBtn2">
        <i class="fas fa-arrow-left"></i> Back to Results
      </button>
    </div>
  `;

  // Wire close buttons
  const closeReport = () => {
    reportScreen.style.display = "none";
    document.getElementById("quizResults").style.display = "block";
  };
  reportScreen
    .querySelector("#closeReportBtn")
    .addEventListener("click", closeReport);
  reportScreen
    .querySelector("#closeReportBtn2")
    .addEventListener("click", closeReport);
}

function showQuizReport() {
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizReportScreen").style.display = "block";
}

// Core quiz launcher — called by both backend sessions and local quizzes
function launchQuiz(id, title, questions) {
  currentQuiz = { id, title, questions };
  currentQuestionIndex = 0;
  userAnswers = new Array(questions.length).fill(null);

  document.getElementById("examSelectionScreen").style.display = "none";
  document.getElementById("quizStartScreen").style.display = "none";
  document.getElementById("quizInterface").style.display = "block";
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizReportScreen").style.display = "none";

  renderQuestionNavGrid();

  quizStartTime = Date.now();
  // Time limit: 0.9 min per question (derived from 20 questions → 18 min)
  quizTimeLimitMs = Math.round(questions.length * 0.9 * 60 * 1000);
  startQuizTimer();

  loadQuestion(0);
  closeSidebar();
}

function hideExamSelectionScreen() {
  document.getElementById("examSelectionScreen").style.display = "none";
  document.getElementById("quizStartScreen").style.display = "block";
}

function startQuiz(quizId) {
  currentSessionMeta = null; // local quiz, not a backend session
  const quizEntry = QUIZ_DATA.quizzes.find((q) => q.id === quizId);
  launchQuiz(quizEntry.id, quizEntry.title, quizEntry.questions);
}

function renderQuestionNavGrid() {
  const grid = document.getElementById("questionNavGrid");
  grid.innerHTML = "";

  let lastSubtopic = null;

  for (let i = 0; i < currentQuiz.questions.length; i++) {
    const q = currentQuiz.questions[i];
    const subtopicLabel = q.subtopic ?? null;

    // Insert a divider label whenever the subtopic changes
    if (subtopicLabel && subtopicLabel !== lastSubtopic) {
      const divider = document.createElement("div");
      divider.className = "question-nav-divider";
      divider.textContent = subtopicLabel;
      divider.title = subtopicLabel;
      grid.appendChild(divider);
      lastSubtopic = subtopicLabel;
    }

    const btn = document.createElement("button");
    btn.className = "question-nav-btn";
    if (i === 0) btn.classList.add("current");
    btn.textContent = i + 1;
    btn.title = subtopicLabel
      ? `${subtopicLabel} — Q${i + 1}`
      : `Question ${i + 1}`;
    btn.addEventListener("click", () => jumpToQuestion(i));
    grid.appendChild(btn);
  }
}

function jumpToQuestion(index) {
  loadQuestion(index);
}

function loadQuestion(index) {
  currentQuestionIndex = index;
  const question = currentQuiz.questions[index];

  document.getElementById("currentQuestion").textContent = index + 1;
  document.getElementById("totalQuestions").textContent =
    currentQuiz.questions.length;

  const progressPercent = ((index + 1) / currentQuiz.questions.length) * 100;
  document.getElementById("progressFill").style.width = progressPercent + "%";

  document.querySelectorAll(".question-nav-btn").forEach((btn, i) => {
    btn.classList.remove("current");
    if (i === index) btn.classList.add("current");
  });

  document.getElementById("questionTopic").textContent = question.topic;

  // Lazily inject the subtopic badge element next to the topic label (once)
  const topicEl = document.getElementById("questionTopic");
  if (topicEl && !document.getElementById("questionSubtopicBadge")) {
    const badge = document.createElement("span");
    badge.id = "questionSubtopicBadge";
    topicEl.parentNode.insertBefore(badge, topicEl.nextSibling);
  }

  // Show/hide the subtopic badge
  const subtopicBadgeEl = document.getElementById("questionSubtopicBadge");
  if (subtopicBadgeEl) {
    if (question.subtopic) {
      subtopicBadgeEl.textContent = question.subtopic;
      subtopicBadgeEl.style.display = "inline-flex";
    } else {
      subtopicBadgeEl.style.display = "none";
    }
  }

  document.getElementById("questionText").textContent = question.question;

  const imageContainer = document.getElementById("questionImageContainer");
  if (question.image) {
    document.getElementById("questionImage").src = question.image;
    imageContainer.style.display = "block";
  } else {
    imageContainer.style.display = "none";
  }

  const optionsContainer = document.getElementById("answerOptions");
  const letters = ["A", "B", "C", "D"];
  const isReview = currentQuiz.reviewMode === true;

  optionsContainer.innerHTML = question.options
    .map((option, i) => {
      const isCorrect = i === question.correctAnswer;
      const isUserAnswer = userAnswers[index] === i;
      let reviewClass = "";
      if (isReview) {
        if (isCorrect) reviewClass = " review-correct";
        else if (isUserAnswer && !isCorrect) reviewClass = " review-wrong";
      }
      return `
        <div class="answer-option${isReview ? " review-mode" : ""}${reviewClass}" data-option-index="${i}">
          <input type="radio" name="answer" id="answer${i}" value="${i}"
            ${isUserAnswer ? "checked" : ""}
            ${isReview ? "disabled" : ""}>
          <label for="answer${i}">
            <span class="option-letter">${letters[i]}</span>
            <span class="option-text">${option}</span>
          </label>
        </div>`;
    })
    .join("");

  // Only attach interaction listeners when NOT in review mode
  if (!isReview) {
    optionsContainer.querySelectorAll(".answer-option").forEach((optionEl) => {
      optionEl.addEventListener("click", () =>
        selectAnswer(parseInt(optionEl.dataset.optionIndex)),
      );
    });
  }

  document.getElementById("prevBtn").disabled = index === 0;

  const isLastQuestion = index === currentQuiz.questions.length - 1;
  document.getElementById("nextBtn").style.display = isLastQuestion
    ? "none"
    : "flex";
  document.getElementById("submitBtn").style.display = isLastQuestion
    ? "flex"
    : "none";

  updateNavigationButtons();
}

function selectAnswer(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;

  const navBtns = document.querySelectorAll(".question-nav-btn");
  navBtns[currentQuestionIndex].classList.add("answered");

  updateNavigationButtons();
}

function updateNavigationButtons() {
  const hasAnswer = userAnswers[currentQuestionIndex] !== null;
  const isLastQuestion =
    currentQuestionIndex === currentQuiz.questions.length - 1;

  if (isLastQuestion) {
    document.getElementById("submitBtn").disabled = !hasAnswer;
  } else {
    document.getElementById("nextBtn").disabled = !hasAnswer;
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    loadQuestion(currentQuestionIndex - 1);
  }
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    loadQuestion(currentQuestionIndex + 1);
  }
}

function startQuizTimer() {
  clearInterval(timerInterval);
  const timerEl = document.getElementById("quizTimer");

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - quizStartTime;
    const remaining = Math.max(0, quizTimeLimitMs - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // Colour cues
    const wrap = timerEl.closest("#quizCountdownWrap") ?? timerEl;
    wrap.classList.toggle("warning", remaining <= 60000);
    wrap.classList.toggle("caution", remaining > 60000 && remaining <= 180000);

    if (remaining === 0) {
      clearInterval(timerInterval);
      submitQuiz(); // time is up — auto-submit
    }
  }, 1000);
}

function submitQuiz() {
  clearInterval(timerInterval);

  const totalTime = Date.now() - quizStartTime;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);

  let correctCount = 0;
  currentQuiz.questions.forEach((q, index) => {
    if (userAnswers[index] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round(
    (correctCount / currentQuiz.questions.length) * 100,
  );
  const incorrectCount = currentQuiz.questions.length - correctCount;

  document.querySelectorAll(".question-nav-btn").forEach((btn, i) => {
    btn.classList.remove("current", "answered");
    if (userAnswers[i] === currentQuiz.questions[i].correctAnswer) {
      btn.classList.add("correct");
    } else {
      btn.classList.add("incorrect");
    }
  });

  document.getElementById("quizInterface").style.display = "none";
  document.getElementById("quizResults").style.display = "block";

  document.getElementById("scorePercentage").textContent = percentage + "%";
  document.getElementById("scoreRatio").textContent =
    `${correctCount}/${currentQuiz.questions.length}`;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("incorrectCount").textContent = incorrectCount;
  document.getElementById("totalTime").textContent =
    `${minutes}:${String(seconds).padStart(2, "0")}`;

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (percentage / 100) * circumference;
  document.getElementById("scoreCircle").style.strokeDashoffset = offset;

  const icon = document.getElementById("resultsIcon");
  const message = document.getElementById("resultsMessage");

  icon.className = "results-icon";
  if (percentage >= 90) {
    icon.classList.add("excellent");
    icon.innerHTML = '<i class="fas fa-trophy"></i>';
    message.textContent = "Excellent! You're ready for the road!";
  } else if (percentage >= 75) {
    icon.classList.add("good");
    icon.innerHTML = '<i class="fas fa-star"></i>';
    message.textContent = "Good job! Keep practicing!";
  } else if (percentage >= 60) {
    icon.classList.add("fair");
    icon.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    message.textContent = "Not bad! Review and try again.";
  } else {
    icon.classList.add("poor");
    icon.innerHTML = '<i class="fas fa-book"></i>';
    message.textContent = "Keep studying! You'll get there.";
  }

  // Build the detailed report (rendered but hidden until user clicks "View Report")
  buildQuizReport(correctCount, incorrectCount, percentage, minutes, seconds);
}

function reviewAnswers() {
  currentQuiz.reviewMode = true;
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizInterface").style.display = "block";
  loadQuestion(0);
}

async function retakeQuiz() {
  if (!currentSessionMeta) {
    // Local QUIZ_DATA quiz
    startQuiz(currentQuiz.id);
    return;
  }

  if (currentSessionMeta.topicName) {
    // Backend topic quiz / exercise — re-fetch for a fresh random set
    try {
      await fetchAndStartTopicQuiz(
        currentSessionMeta.topicName,
        currentSessionMeta.mode ?? "quiz",
        currentSessionMeta.subtopic ?? null,
      );
    } catch (err) {
      console.error("Retake failed, relaunching cached questions:", err);
      launchQuiz(currentQuiz.id, currentQuiz.title, currentQuiz.questions);
    }
  } else {
    // Police exam session — relaunch with the already-normalized questions
    launchQuiz(currentQuiz.id, currentQuiz.title, currentQuiz.questions);
  }
}

function backToQuizSelection() {
  document.getElementById("quizResults").style.display = "none";

  if (!currentSessionMeta) {
    // Local quiz
    document.getElementById("quizStartScreen").style.display = "block";
    return;
  }

  if (currentSessionMeta.topicName) {
    // Came from a backend topic quiz — go back to that topic's options screen.
    // We need to reconstruct the topic object; a minimal one is enough.
    const syntheticTopic = {
      name: currentSessionMeta.topicName,
      subtopics: currentSessionMeta.subtopic
        ? [{ name: currentSessionMeta.subtopic }]
        : [],
    };
    showTopicQuizOptions(syntheticTopic);
  } else {
    // Police exam session — go back to the exam grid
    const multiQuiz = QUIZ_DATA.quizzes.find((q) => q.isMultiSession);
    showExamSelectionScreen(multiQuiz);
  }
}

// ============================================
// MODE SWITCHING
// ============================================

function switchMode(mode) {
  currentMode = mode;

  document
    .querySelectorAll(".mode-btn")
    .forEach((btn) => btn.classList.remove("active"));

  if (mode === "content") {
    document.getElementById("contentModeBtn").classList.add("active");
    document.getElementById("dashTitle").textContent =
      "Dashboard - Content Mode";
    document.getElementById("contentSidebar").classList.add("active");
    document.getElementById("qaSidebar").classList.remove("active");
    document.getElementById("contentModeView").classList.add("active");
    document.getElementById("qaModeView").classList.remove("active");
  } else {
    document.getElementById("qaModeBtn").classList.add("active");
    document.getElementById("dashTitle").textContent = "Dashboard - Q&A Mode";
    document.getElementById("qaSidebar").classList.add("active");
    document.getElementById("contentSidebar").classList.remove("active");
    document.getElementById("qaModeView").classList.add("active");
    document.getElementById("contentModeView").classList.remove("active");
  }

  closeSidebar();
}

// ============================================
// UI HELPERS
// ============================================

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

function backToWelcome() {
  document.getElementById("contentDisplay").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "block";

  document
    .querySelectorAll(".subtopic-link")
    .forEach((link) => link.classList.remove("active"));
}

function bookmarkContent() {
  alert("Bookmark feature coming soon!");
}

function printContent() {
  window.print();
}

// ============================================
// MOBILE MENU
// ============================================

function toggleMobileMenu() {
  document.querySelector(".links").classList.toggle("active");
}
