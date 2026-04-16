// ============================================
// PLACEHOLDER DATA - EASY TO REPLACE FROM BACKEND
// ============================================

// ===== CONTENT MODE DATA =====
const CONTENT_DATA = {
    topics: [
        {
            id: 'overview',
            title: 'Overview',
            icon: 'fas fa-map',
            subtopics: [
                {
                    id: 'intro',
                    title: 'Introduction',
                    formatType: 'flip_card', // Options: flip_card, image_right, image_left, image_overlay, accordion, tabs, timeline
                    content: {
                        cards: [
                            {
                                image: 'https://via.placeholder.com/400x300/0097b2/ffffff?text=Road+Safety',
                                title: 'Road Safety Basics',
                                description: 'Understanding road safety is crucial for all drivers and pedestrians. Learn the fundamental principles that keep everyone safe on the road.'
                            },
                            {
                                image: 'https://via.placeholder.com/400x300/1e40af/ffffff?text=Traffic+Rules',
                                title: 'Traffic Rules',
                                description: 'Traffic rules are designed to create order and predictability on the roads. Following these rules prevents accidents and saves lives.'
                            },
                            {
                                image: 'https://via.placeholder.com/400x300/16a34a/ffffff?text=Driver+Responsibility',
                                title: 'Driver Responsibility',
                                description: 'Every driver has a responsibility to ensure their own safety and the safety of others. This includes being alert, following rules, and maintaining your vehicle.'
                            }
                        ]
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'What is the primary purpose of traffic rules?',
                                options: [
                                    'To make driving difficult',
                                    'To create order and prevent accidents',
                                    'To generate revenue',
                                    'To slow down traffic'
                                ],
                                correctAnswer: 1
                            },
                            {
                                question: 'Who is responsible for road safety?',
                                options: [
                                    'Only the police',
                                    'Only drivers',
                                    'Everyone using the road',
                                    'Only pedestrians'
                                ],
                                correctAnswer: 2
                            }
                        ]
                    }
                },
                {
                    id: 'getting-started',
                    title: 'Getting Started',
                    formatType: 'image_right',
                    content: {
                        title: 'Your Journey to Safe Driving',
                        text: [
                            'Starting your driving journey requires preparation and knowledge. Before you get behind the wheel, it\'s essential to understand the basics of vehicle operation and road safety.',
                            'The first step is obtaining your learner\'s permit. This involves studying traffic laws, understanding road signs, and passing a written examination. Take your time to study and ensure you understand all the material.',
                            'Practice is crucial. Start in low-traffic areas and gradually progress to busier roads as you gain confidence. Always practice with a licensed driver who can provide guidance and feedback.',
                            'Remember that learning to drive is a gradual process. Don\'t rush - focus on building good habits from the beginning.'
                        ],
                        image: 'https://via.placeholder.com/400x500/0097b2/ffffff?text=Getting+Started'
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'What should you do before getting behind the wheel?',
                                options: [
                                    'Jump in and start driving',
                                    'Study traffic laws and understand road signs',
                                    'Buy an expensive car',
                                    'Get insurance only'
                                ],
                                correctAnswer: 1
                            }
                        ]
                    }
                },
                {
                    id: 'basics',
                    title: 'Road Basics',
                    formatType: 'accordion',
                    content: {
                        sections: [
                            {
                                title: 'Understanding Road Markings',
                                text: 'Road markings are painted lines and symbols on the road surface that provide information to drivers. White lines separate lanes of traffic moving in the same direction, while yellow lines separate traffic moving in opposite directions.',
                                image: 'https://via.placeholder.com/500x300/0097b2/ffffff?text=Road+Markings'
                            },
                            {
                                title: 'Lane Discipline',
                                text: 'Maintaining proper lane discipline is essential for safe driving. Always stay in your lane unless you need to change lanes. Use your turn signals before changing lanes and check your mirrors and blind spots.',
                                image: 'https://via.placeholder.com/500x300/1e40af/ffffff?text=Lane+Discipline'
                            },
                            {
                                title: 'Speed Management',
                                text: 'Driving at appropriate speeds is crucial for safety. Always observe posted speed limits and adjust your speed based on road conditions, weather, and traffic. Remember that speed limits are maximums, not targets.',
                                image: 'https://via.placeholder.com/500x300/16a34a/ffffff?text=Speed+Management'
                            }
                        ]
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'What color are the lines that separate opposing traffic?',
                                options: [
                                    'White',
                                    'Yellow',
                                    'Red',
                                    'Blue'
                                ],
                                correctAnswer: 1
                            }
                        ]
                    }
                }
            ]
        },
        {
            id: 'traffic-signs',
            title: 'Traffic Signs',
            icon: 'fas fa-traffic-light',
            subtopics: [
                {
                    id: 'warning',
                    title: 'Warning Signs',
                    formatType: 'timeline',
                    content: {
                        steps: [
                            {
                                title: 'Sharp Curve Ahead',
                                description: 'This sign warns you that there is a sharp curve ahead. Reduce your speed before entering the curve and maintain a safe speed throughout.',
                                image: 'https://via.placeholder.com/400x300/f59e0b/000000?text=Curve+Warning'
                            },
                            {
                                title: 'Intersection Warning',
                                description: 'Indicates that you are approaching an intersection. Be prepared to slow down or stop, and watch for cross traffic.',
                                image: 'https://via.placeholder.com/400x300/f59e0b/000000?text=Intersection'
                            },
                            {
                                title: 'Animal Crossing',
                                description: 'Watch for animals that may cross the road. Be especially alert during dawn and dusk when animals are most active.',
                                image: 'https://via.placeholder.com/400x300/f59e0b/000000?text=Animal+Crossing'
                            }
                        ]
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'What should you do when you see a curve warning sign?',
                                options: [
                                    'Speed up',
                                    'Reduce speed before the curve',
                                    'Ignore it',
                                    'Honk your horn'
                                ],
                                correctAnswer: 1
                            }
                        ]
                    }
                },
                {
                    id: 'regulatory',
                    title: 'Regulatory Signs',
                    formatType: 'tabs',
                    content: {
                        tabs: [
                            {
                                title: 'Stop Signs',
                                content: 'A stop sign requires you to come to a complete stop. You must stop before the stop line, crosswalk, or intersection. Look left, right, and left again before proceeding.',
                                image: 'https://via.placeholder.com/600x400/dc2626/ffffff?text=STOP'
                            },
                            {
                                title: 'Yield Signs',
                                content: 'Yield signs indicate that you must slow down and be prepared to stop. Give the right-of-way to vehicles and pedestrians already in the intersection or approaching from another direction.',
                                image: 'https://via.placeholder.com/600x400/f59e0b/ffffff?text=YIELD'
                            },
                            {
                                title: 'Speed Limit Signs',
                                content: 'Speed limit signs show the maximum legal speed. You may drive slower than the posted speed but never faster. Adjust your speed for weather and road conditions.',
                                image: 'https://via.placeholder.com/600x400/0097b2/ffffff?text=50+KM/H'
                            }
                        ]
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'What must you do at a stop sign?',
                                options: [
                                    'Slow down',
                                    'Come to a complete stop',
                                    'Honk and proceed',
                                    'Speed up'
                                ],
                                correctAnswer: 1
                            }
                        ]
                    }
                },
                {
                    id: 'information',
                    title: 'Information Signs',
                    formatType: 'image_left',
                    content: {
                        title: 'Understanding Information Signs',
                        text: [
                            'Information signs provide helpful details about services, destinations, and points of interest. They are typically blue or green and are designed to help you navigate.',
                            'Green signs indicate directions and distances to cities and towns. Blue signs show services such as gas stations, hospitals, and rest areas.',
                            'Brown signs point to recreational areas, parks, and tourist attractions. These signs help you plan your route and find necessary services along the way.'
                        ],
                        image: 'https://via.placeholder.com/400x500/16a34a/ffffff?text=Information+Signs'
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'What color are service information signs?',
                                options: [
                                    'Red',
                                    'Green',
                                    'Blue',
                                    'Yellow'
                                ],
                                correctAnswer: 2
                            }
                        ]
                    }
                }
            ]
        },
        {
            id: 'road-rules',
            title: 'Road Rules',
            icon: 'fas fa-road',
            subtopics: [
                {
                    id: 'speed-limits',
                    title: 'Speed Limits',
                    formatType: 'image_overlay',
                    content: {
                        title: 'Understanding Speed Limits',
                        description: 'Speed limits are set to ensure the safety of all road users. They vary depending on the type of road, location, and conditions. Always observe posted limits and adjust your speed for weather and traffic.',
                        image: 'https://via.placeholder.com/1200x500/0097b2/ffffff?text=Speed+Limits'
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'Can you drive faster than the posted speed limit?',
                                options: [
                                    'Yes, if traffic is light',
                                    'Yes, if you\'re in a hurry',
                                    'No, never',
                                    'Yes, on highways only'
                                ],
                                correctAnswer: 2
                            }
                        ]
                    }
                },
                {
                    id: 'right-of-way',
                    title: 'Right of Way',
                    formatType: 'flip_card',
                    content: {
                        cards: [
                            {
                                image: 'https://via.placeholder.com/400x300/0097b2/ffffff?text=Intersection',
                                title: 'At Intersections',
                                description: 'At a four-way stop, the first vehicle to arrive has the right-of-way. If multiple vehicles arrive simultaneously, the vehicle on the right has priority.'
                            },
                            {
                                image: 'https://via.placeholder.com/400x300/1e40af/ffffff?text=Pedestrian',
                                title: 'Pedestrian Crossings',
                                description: 'Pedestrians always have the right-of-way at marked crosswalks. Always stop and allow them to cross safely before proceeding.'
                            },
                            {
                                image: 'https://via.placeholder.com/400x300/16a34a/ffffff?text=Emergency',
                                title: 'Emergency Vehicles',
                                description: 'Emergency vehicles with lights and sirens always have the right-of-way. Pull over to the right and stop until they pass.'
                            }
                        ]
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'Who has the right-of-way at a pedestrian crossing?',
                                options: [
                                    'The driver',
                                    'The pedestrian',
                                    'Whoever gets there first',
                                    'The larger vehicle'
                                ],
                                correctAnswer: 1
                            }
                        ]
                    }
                },
                {
                    id: 'parking',
                    title: 'Parking Rules',
                    formatType: 'accordion',
                    content: {
                        sections: [
                            {
                                title: 'Parallel Parking',
                                text: 'When parallel parking, ensure you are within 30cm of the curb. Turn your wheels away from the curb when parking uphill, and toward the curb when parking downhill.',
                                image: 'https://via.placeholder.com/500x300/0097b2/ffffff?text=Parallel+Parking'
                            },
                            {
                                title: 'No Parking Zones',
                                text: 'Never park in fire lanes, in front of driveways, within 5 meters of a fire hydrant, or in designated no-parking zones. Violations can result in fines and towing.',
                                image: 'https://via.placeholder.com/500x300/dc2626/ffffff?text=No+Parking'
                            },
                            {
                                title: 'Parking Lots',
                                text: 'In parking lots, observe all signs and markings. Park within the lines, and be especially careful when backing out as visibility may be limited.',
                                image: 'https://via.placeholder.com/500x300/16a34a/ffffff?text=Parking+Lot'
                            }
                        ]
                    },
                    exercise: {
                        questions: [
                            {
                                question: 'How close to a fire hydrant can you park?',
                                options: [
                                    'As close as you want',
                                    'At least 3 meters away',
                                    'At least 5 meters away',
                                    'At least 10 meters away'
                                ],
                                correctAnswer: 2
                            }
                        ]
                    }
                }
            ]
        }
    ]
};

// ===== QUIZ MODE DATA =====
const QUIZ_DATA = {
    quizzes: [
        {
            id: 'overview',
            title: 'Overview',
            icon: 'fas fa-map',
            questionCount: 10,
            questions: [
                {
                    topic: 'Overview',
                    question: 'What is the primary purpose of traffic rules?',
                    options: [
                        'To make driving difficult',
                        'To create order and prevent accidents',
                        'To generate revenue',
                        'To slow down traffic'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'At what age can you apply for a learner\'s permit in Rwanda?',
                    options: [
                        '16 years',
                        '17 years',
                        '18 years',
                        '21 years'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'What should you always carry while driving?',
                    options: [
                        'Only your car keys',
                        'Driver\'s license, registration, and insurance',
                        'Just your phone',
                        'Only insurance'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'Who is responsible for road safety?',
                    options: [
                        'Only the police',
                        'Only drivers',
                        'Everyone using the road',
                        'Only pedestrians'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'What is defensive driving?',
                    options: [
                        'Driving aggressively to defend your position',
                        'Anticipating potential hazards and driving safely',
                        'Driving very slowly',
                        'Ignoring other drivers'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'When should you use your horn?',
                    options: [
                        'Whenever you feel like it',
                        'To greet friends',
                        'Only to warn of danger',
                        'In residential areas at night'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'What does a solid white line indicate?',
                    options: [
                        'You can cross it anytime',
                        'Lane changes are discouraged',
                        'Parking is allowed',
                        'Speed up zone'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'What should you do before starting your vehicle?',
                    options: [
                        'Just turn the key and go',
                        'Check mirrors, seat position, and seatbelt',
                        'Turn on the radio',
                        'Make a phone call'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'What is the safest following distance?',
                    options: [
                        'As close as possible',
                        '1 second',
                        'At least 3 seconds',
                        '10 seconds'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Overview',
                    question: 'When must you yield to pedestrians?',
                    options: [
                        'Never',
                        'Only at traffic lights',
                        'Always, especially at crosswalks',
                        'Only if they wave'
                    ],
                    correctAnswer: 2,
                    image: null
                }
            ]
        },
        {
            id: 'traffic-signs',
            title: 'Traffic Signs',
            icon: 'fas fa-traffic-light',
            questionCount: 15,
            questions: [
                {
                    topic: 'Traffic Signs',
                    question: 'What does a red octagonal sign indicate?',
                    options: [
                        'Yield',
                        'Stop',
                        'Speed limit',
                        'No parking'
                    ],
                    correctAnswer: 1,
                    image: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=STOP'
                },
                {
                    topic: 'Traffic Signs',
                    question: 'What color are warning signs typically?',
                    options: [
                        'Red',
                        'Blue',
                        'Yellow/Orange',
                        'Green'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'What does a triangular sign with red border mean?',
                    options: [
                        'Stop',
                        'Yield/Give Way',
                        'No Entry',
                        'Speed Limit'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'What do blue circular signs typically indicate?',
                    options: [
                        'Prohibitions',
                        'Warnings',
                        'Mandatory instructions',
                        'Information'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'A sign with a red circle and line means:',
                    options: [
                        'Caution ahead',
                        'Prohibited action',
                        'Information available',
                        'Service area'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'What does a yellow diamond sign indicate?',
                    options: [
                        'Stop required',
                        'Warning of road conditions ahead',
                        'No parking',
                        'Hospital nearby'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'Green signs typically provide:',
                    options: [
                        'Warning information',
                        'Regulatory information',
                        'Directional/Guide information',
                        'Construction information'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'A circular sign with diagonal line means:',
                    options: [
                        'End of restriction',
                        'New restriction starts',
                        'Caution',
                        'Service available'
                    ],
                    correctAnswer: 0,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'What should you do when you see a school zone sign?',
                    options: [
                        'Speed up to pass quickly',
                        'Reduce speed and watch for children',
                        'Honk to alert children',
                        'Maintain normal speed'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'Railroad crossing signs are what shape?',
                    options: [
                        'Circular',
                        'Rectangular',
                        'Circular with X',
                        'Triangular'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'What does a "No U-Turn" sign look like?',
                    options: [
                        'Red circle with U and line through it',
                        'Blue square',
                        'Yellow diamond',
                        'Green rectangle'
                    ],
                    correctAnswer: 0,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'Brown signs indicate:',
                    options: [
                        'Danger zones',
                        'Recreational areas or tourist attractions',
                        'Construction zones',
                        'School zones'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'A flashing yellow light means:',
                    options: [
                        'Stop immediately',
                        'Proceed with caution',
                        'Speed up',
                        'Yield to all traffic'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'What does a "One Way" sign indicate?',
                    options: [
                        'Traffic flows in both directions',
                        'Traffic flows in indicated direction only',
                        'No entry',
                        'Two-way traffic ahead'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Traffic Signs',
                    question: 'Pentagon-shaped signs are used for:',
                    options: [
                        'Parking areas',
                        'School zones',
                        'Highway exits',
                        'Construction zones'
                    ],
                    correctAnswer: 1,
                    image: null
                }
            ]
        },
        {
            id: 'road-rules',
            title: 'Road Rules',
            icon: 'fas fa-road',
            questionCount: 12,
            questions: [
                {
                    topic: 'Road Rules',
                    question: 'What is the typical speed limit in urban areas?',
                    options: [
                        '30 km/h',
                        '40 km/h',
                        '50 km/h',
                        '60 km/h'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'When turning right, you should:',
                    options: [
                        'Speed up',
                        'Signal and check blind spots',
                        'Never signal',
                        'Turn from any lane'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'At a four-way stop, who goes first?',
                    options: [
                        'The largest vehicle',
                        'The first to arrive',
                        'The fastest driver',
                        'Always the vehicle on the left'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'You must not park within ___ of a fire hydrant:',
                    options: [
                        '3 meters',
                        '5 meters',
                        '7 meters',
                        '10 meters'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'When is it legal to exceed the speed limit?',
                    options: [
                        'When passing',
                        'In an emergency with police escort',
                        'Never',
                        'On highways only'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'What should you do when an emergency vehicle approaches?',
                    options: [
                        'Speed up',
                        'Pull over to the right and stop',
                        'Continue at same speed',
                        'Pull over to the left'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'Seat belts must be worn by:',
                    options: [
                        'Only the driver',
                        'Driver and front passenger',
                        'All occupants',
                        'No one on short trips'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'Using a mobile phone while driving is:',
                    options: [
                        'Allowed with hands-free',
                        'Never allowed',
                        'Allowed in traffic',
                        'Allowed for emergencies only without hands-free'
                    ],
                    correctAnswer: 0,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'Before changing lanes, you must:',
                    options: [
                        'Just move over',
                        'Check mirrors and blind spots, signal',
                        'Honk your horn',
                        'Flash your lights'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'The left lane on a highway is for:',
                    options: [
                        'Slower traffic',
                        'Passing/faster traffic',
                        'Trucks only',
                        'Emergency vehicles only'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'You should increase following distance when:',
                    options: [
                        'Roads are dry',
                        'Weather is poor or roads are wet',
                        'Traffic is light',
                        'Driving in daytime'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Road Rules',
                    question: 'At a pedestrian crossing without signals, you must:',
                    options: [
                        'Speed up to cross before pedestrians',
                        'Honk at pedestrians',
                        'Yield to pedestrians',
                        'Maintain your speed'
                    ],
                    correctAnswer: 2,
                    image: null
                }
            ]
        },
        {
            id: 'latest-exam',
            title: 'Latest Police Exam',
            icon: 'fas fa-certificate', // Different icon for Latest Exam
            questionCount: 20,
            questions: [
                {
                    topic: 'Latest Exam',
                    question: 'What is the maximum blood alcohol content (BAC) allowed for drivers?',
                    options: [
                        '0.00%',
                        '0.05%',
                        '0.08%',
                        '0.10%'
                    ],
                    correctAnswer: 0,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'When must you dim your headlights?',
                    options: [
                        'Never',
                        'When following another vehicle or meeting oncoming traffic',
                        'Only in the city',
                        'Only on highways'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'What does a solid yellow line mean?',
                    options: [
                        'Passing is allowed',
                        'No passing allowed',
                        'Caution zone',
                        'Parking zone'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'At what distance should you signal before turning?',
                    options: [
                        'At the turn',
                        'At least 30 meters before',
                        '5 meters before',
                        'Signaling is optional'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'What should you do if your brakes fail?',
                    options: [
                        'Pump the brake pedal and use emergency brake',
                        'Turn off the engine',
                        'Jump out of the vehicle',
                        'Speed up'
                    ],
                    correctAnswer: 0,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'Children under what age must be in a child safety seat?',
                    options: [
                        '3 years',
                        '5 years',
                        '7 years',
                        '10 years'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'When parking uphill with a curb, turn your wheels:',
                    options: [
                        'Away from the curb',
                        'Toward the curb',
                        'Straight',
                        'Either way'
                    ],
                    correctAnswer: 0,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'A flashing red traffic light means:',
                    options: [
                        'Proceed with caution',
                        'Stop, then proceed when safe',
                        'Speed up',
                        'Yield'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'You are required to stop for a school bus when:',
                    options: [
                        'Never',
                        'Only if children are visible',
                        'When red lights are flashing and stop arm is extended',
                        'Only during school hours'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'What is the minimum tread depth required for tires?',
                    options: [
                        '1.0mm',
                        '1.6mm',
                        '2.0mm',
                        '3.0mm'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'When approaching a roundabout, you should:',
                    options: [
                        'Speed up to enter quickly',
                        'Yield to traffic already in the roundabout',
                        'Honk before entering',
                        'Stop completely'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'Hydroplaning occurs when:',
                    options: [
                        'Tires lose contact with road due to water',
                        'Brakes overheat',
                        'Engine overheats',
                        'Tire pressure is too high'
                    ],
                    correctAnswer: 0,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'What does ABS stand for?',
                    options: [
                        'Automatic Brake System',
                        'Anti-lock Braking System',
                        'Advanced Brake Safety',
                        'Assisted Braking System'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'You must report an accident to police when:',
                    options: [
                        'Only if someone is injured',
                        'Always, regardless of damage',
                        'If damage exceeds a certain amount or injuries occur',
                        'Never, insurance handles it'
                    ],
                    correctAnswer: 2,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'When is it safe to pass another vehicle?',
                    options: [
                        'Anytime',
                        'When you have clear visibility and no oncoming traffic',
                        'Only on highways',
                        'Never'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'What should you do in foggy conditions?',
                    options: [
                        'Use high beams',
                        'Use low beams and fog lights, reduce speed',
                        'Turn off all lights',
                        'Speed up to get through quickly'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'The two-second rule refers to:',
                    options: [
                        'How long to signal',
                        'Safe following distance',
                        'Time to check mirrors',
                        'Reaction time'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'You should avoid driving when:',
                    options: [
                        'You are well-rested',
                        'You are tired, sick, or under influence',
                        'It\'s raining lightly',
                        'Traffic is heavy'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'When parallel parking, you should be within ___ of the curb:',
                    options: [
                        '15cm',
                        '30cm',
                        '50cm',
                        '1 meter'
                    ],
                    correctAnswer: 1,
                    image: null
                },
                {
                    topic: 'Latest Exam',
                    question: 'What is the safest way to exit a highway?',
                    options: [
                        'Brake hard before the exit',
                        'Signal early, move to exit lane, reduce speed gradually',
                        'Exit quickly without signaling',
                        'Maintain highway speed until the last moment'
                    ],
                    correctAnswer: 1,
                    image: null
                }
            ]
        }
    ]
};

// ============================================
// STATE MANAGEMENT
// ============================================

let currentMode = 'content';
let currentTopic = null;
let currentSubtopic = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartTime = null;
let timerInterval = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadContentSidebar();
    loadQuizSidebar();
    setupEventListeners();
}

// ============================================
// CONTENT MODE FUNCTIONS
// ============================================

function loadContentSidebar() {
    const topicsNav = document.getElementById('topicsNav');
    topicsNav.innerHTML = '';
    
    CONTENT_DATA.topics.forEach(topic => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'topic';
        
        const subtopicsHTML = topic.subtopics.map(subtopic => `
            <a href="#" class="subtopic-link" onclick="loadContent(event, '${topic.id}', '${subtopic.id}')">
                <i class="fas fa-file-alt"></i> ${subtopic.title}
            </a>
        `).join('');
        
        topicDiv.innerHTML = `
            <div class="topic-header" onclick="toggleTopic(this)">
                <span>${topic.title}</span>
                <span class="topic-icon"><i class="fas fa-chevron-right"></i></span>
            </div>
            <div class="subtopics">
                ${subtopicsHTML}
            </div>
        `;
        
        topicsNav.appendChild(topicDiv);
    });
}

function toggleTopic(element) {
    const topic = element.parentElement;
    const subtopics = topic.querySelector('.subtopics');
    const isActive = element.classList.contains('active');
    
    // Close all topics
    document.querySelectorAll('.topic-header').forEach(header => {
        header.classList.remove('active');
    });
    document.querySelectorAll('.subtopics').forEach(sub => {
        sub.classList.remove('open');
    });
    
    // Open clicked topic if it wasn't active
    if (!isActive) {
        element.classList.add('active');
        subtopics.classList.add('open');
    }
}

function loadContent(event, topicId, subtopicId) {
    event.preventDefault();
    
    // Update active state
    document.querySelectorAll('.subtopic-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.closest('.subtopic-link').classList.add('active');
    
    // Find content
    const topic = CONTENT_DATA.topics.find(t => t.id === topicId);
    const subtopic = topic.subtopics.find(s => s.id === subtopicId);
    
    currentTopic = topic;
    currentSubtopic = subtopic;
    
    // Hide welcome, show content
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('contentDisplay').style.display = 'block';
    
    // Set title
    document.getElementById('contentTitle').textContent = subtopic.title;
    
    // Render content based on format
    renderContent(subtopic);
    
    // Show exercise if available
    if (subtopic.exercise) {
        renderExercise(subtopic.exercise);
    } else {
        document.getElementById('exerciseSection').style.display = 'none';
    }
    
    // Update topic navigation buttons
    updateTopicNavigation(topic, subtopic);
    
    // Close sidebar on mobile
    closeSidebar();
}

function renderContent(subtopic) {
    const container = document.getElementById('contentContainer');
    container.innerHTML = '';
    
    switch(subtopic.formatType) {
        case 'flip_card':
            container.innerHTML = renderFlipCards(subtopic.content.cards);
            break;
        case 'image_right':
            container.innerHTML = renderImageRight(subtopic.content);
            break;
        case 'image_left':
            container.innerHTML = renderImageLeft(subtopic.content);
            break;
        case 'image_overlay':
            container.innerHTML = renderImageOverlay(subtopic.content);
            break;
        case 'accordion':
            container.innerHTML = renderAccordion(subtopic.content.sections);
            break;
        case 'tabs':
            container.innerHTML = renderTabs(subtopic.content.tabs);
            break;
        case 'timeline':
            container.innerHTML = renderTimeline(subtopic.content.steps);
            break;
    }
    
    // Reinitialize interactive elements
    initializeFormatInteractions();
}

// ===== FORMAT RENDERERS =====

function renderFlipCards(cards) {
    return `
        <div class="format-flip-cards">
            ${cards.map((card, index) => `
                <div class="flip-card" onclick="flipCard(this)">
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
            `).join('')}
        </div>
    `;
}

function renderImageRight(content) {
    return `
        <div class="format-image-right">
            <div class="text-content">
                <h3>${content.title}</h3>
                ${content.text.map(p => `<p>${p}</p>`).join('')}
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
                ${content.text.map(p => `<p>${p}</p>`).join('')}
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
            ${sections.map((section, index) => `
                <div class="accordion-item ${index === 0 ? 'active' : ''}">
                    <div class="accordion-header" onclick="toggleAccordion(this)">
                        <h4>${section.title}</h4>
                        <i class="fas fa-chevron-down accordion-icon"></i>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-body">
                            <p>${section.text}</p>
                            ${section.image ? `<img src="${section.image}" alt="${section.title}">` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTabs(tabs) {
    return `
        <div class="format-tabs">
            <div class="tab-headers">
                ${tabs.map((tab, index) => `
                    <button class="tab-header ${index === 0 ? 'active' : ''}" onclick="switchTab(this, ${index})">
                        ${tab.title}
                    </button>
                `).join('')}
            </div>
            ${tabs.map((tab, index) => `
                <div class="tab-content ${index === 0 ? 'active' : ''}" id="tab-${index}">
                    <div class="tab-body">
                        <h4>${tab.title}</h4>
                        <p>${tab.content}</p>
                        ${tab.image ? `<img src="${tab.image}" alt="${tab.title}">` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTimeline(steps) {
    return `
        <div class="format-timeline">
            ${steps.map((step, index) => `
                <div class="timeline-item">
                    <div class="timeline-number">${index + 1}</div>
                    <div class="timeline-content">
                        <h4>${step.title}</h4>
                        <p>${step.description}</p>
                        ${step.image ? `<img src="${step.image}" alt="${step.title}">` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== FORMAT INTERACTIONS =====

function flipCard(card) {
    card.classList.toggle('flipped');
}

function toggleAccordion(header) {
    const item = header.parentElement;
    const wasActive = item.classList.contains('active');
    
    // Close all accordion items
    document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!wasActive) {
        item.classList.add('active');
    }
}

function switchTab(button, index) {
    // Remove active from all
    document.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active to clicked
    button.classList.add('active');
    document.getElementById(`tab-${index}`).classList.add('active');
}

function initializeFormatInteractions() {
    // Set first accordion item as active if exists
    const firstAccordion = document.querySelector('.accordion-item');
    if (firstAccordion) {
        firstAccordion.classList.add('active');
    }
}

// ===== EXERCISE FUNCTIONS =====

function renderExercise(exercise) {
    const exerciseSection = document.getElementById('exerciseSection');
    const exerciseQuestions = document.getElementById('exerciseQuestions');
    
    exerciseQuestions.innerHTML = exercise.questions.map((q, index) => `
        <div class="exercise-question">
            <div class="exercise-question-text">${index + 1}. ${q.question}</div>
            <div class="exercise-options">
                ${q.options.map((option, optIndex) => `
                    <div class="exercise-option">
                        <input type="radio" name="exercise-${index}" id="exercise-${index}-${optIndex}" value="${optIndex}">
                        <label for="exercise-${index}-${optIndex}">${option}</label>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    exerciseSection.style.display = 'block';
    document.getElementById('exerciseResults').style.display = 'none';
}

function submitExercise() {
    const exercise = currentSubtopic.exercise;
    let correctCount = 0;
    
    exercise.questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="exercise-${index}"]:checked`);
        const options = document.querySelectorAll(`input[name="exercise-${index}"]`);
        
        options.forEach((opt, optIndex) => {
            const parent = opt.parentElement;
            parent.classList.remove('correct', 'incorrect');
            
            if (optIndex === q.correctAnswer) {
                parent.classList.add('correct');
            }
            
            if (selected && parseInt(selected.value) === optIndex && optIndex !== q.correctAnswer) {
                parent.classList.add('incorrect');
            }
        });
        
        if (selected && parseInt(selected.value) === q.correctAnswer) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / exercise.questions.length) * 100);
    const resultsDiv = document.getElementById('exerciseResults');
    
    resultsDiv.innerHTML = `
        <h4>Exercise Results</h4>
        <div class="exercise-score">${percentage}%</div>
        <p>You got ${correctCount} out of ${exercise.questions.length} questions correct!</p>
        ${percentage >= 80 ? '<p style="color: var(--success); font-weight: 600;">Great job! You\'ve mastered this topic.</p>' : 
          '<p style="color: var(--warning); font-weight: 600;">Keep practicing to improve your understanding.</p>'}
    `;
    
    resultsDiv.style.display = 'block';
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== TOPIC NAVIGATION =====

function updateTopicNavigation(topic, subtopic) {
    const prevBtn = document.getElementById('prevTopicBtn');
    const nextBtn = document.getElementById('nextTopicBtn');
    
    const topicIndex = CONTENT_DATA.topics.findIndex(t => t.id === topic.id);
    const subtopicIndex = topic.subtopics.findIndex(s => s.id === subtopic.id);
    
    // Check for previous subtopic
    if (subtopicIndex > 0) {
        prevBtn.style.display = 'flex';
        prevBtn.onclick = () => {
            const prevSubtopic = topic.subtopics[subtopicIndex - 1];
            loadContentDirect(topic.id, prevSubtopic.id);
        };
    } else if (topicIndex > 0) {
        prevBtn.style.display = 'flex';
        const prevTopic = CONTENT_DATA.topics[topicIndex - 1];
        const lastSubtopic = prevTopic.subtopics[prevTopic.subtopics.length - 1];
        prevBtn.onclick = () => loadContentDirect(prevTopic.id, lastSubtopic.id);
    } else {
        prevBtn.style.display = 'none';
    }
    
    // Check for next subtopic
    if (subtopicIndex < topic.subtopics.length - 1) {
        nextBtn.style.display = 'flex';
        nextBtn.onclick = () => {
            const nextSubtopic = topic.subtopics[subtopicIndex + 1];
            loadContentDirect(topic.id, nextSubtopic.id);
        };
    } else if (topicIndex < CONTENT_DATA.topics.length - 1) {
        nextBtn.style.display = 'flex';
        const nextTopic = CONTENT_DATA.topics[topicIndex + 1];
        const firstSubtopic = nextTopic.subtopics[0];
        nextBtn.onclick = () => loadContentDirect(nextTopic.id, firstSubtopic.id);
    } else {
        nextBtn.style.display = 'none';
    }
}

function loadContentDirect(topicId, subtopicId) {
    // Open the topic in sidebar
    const topicHeader = Array.from(document.querySelectorAll('.topic-header')).find(
        header => header.textContent.includes(CONTENT_DATA.topics.find(t => t.id === topicId).title)
    );
    
    if (topicHeader && !topicHeader.classList.contains('active')) {
        toggleTopic(topicHeader);
    }
    
    // Find and click the subtopic link
    const subtopicLink = document.querySelector(`.subtopic-link[onclick*="${topicId}"][onclick*="${subtopicId}"]`);
    if (subtopicLink) {
        subtopicLink.click();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateTopic(direction) {
    // This function is called by the navigation buttons
    // The actual navigation is handled by updateTopicNavigation
}

// ============================================
// QUIZ MODE FUNCTIONS
// ============================================

function loadQuizSidebar() {
    const quizNav = document.getElementById('quizTopicsNav');
    quizNav.innerHTML = '';
    
    QUIZ_DATA.quizzes.forEach(quiz => {
        const quizDiv = document.createElement('div');
        quizDiv.className = 'quiz-topic-item';
        quizDiv.onclick = () => startQuiz(quiz.id);
        
        quizDiv.innerHTML = `
            <div class="quiz-topic-icon">
                <i class="${quiz.icon}"></i>
            </div>
            <div class="quiz-topic-info">
                <h4>${quiz.title}</h4>
                <p>${quiz.questionCount} Questions</p>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        
        quizNav.appendChild(quizDiv);
    });
}

function startQuiz(quizId) {
    currentQuiz = QUIZ_DATA.quizzes.find(q => q.id === quizId);
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    
    // Hide start screen, show quiz interface
    document.getElementById('quizStartScreen').style.display = 'none';
    document.getElementById('quizInterface').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    
    // Initialize question navigation grid
    renderQuestionNavGrid();
    
    // Start timer
    quizStartTime = Date.now();
    startQuizTimer();
    
    // Load first question
    loadQuestion(0);
    
    // Close sidebar on mobile
    closeSidebar();
}

function renderQuestionNavGrid() {
    const grid = document.getElementById('questionNavGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < currentQuiz.questions.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'question-nav-btn';
        if (i === 0) btn.classList.add('current');
        btn.textContent = i + 1;
        btn.onclick = () => jumpToQuestion(i);
        grid.appendChild(btn);
    }
}

function jumpToQuestion(index) {
    loadQuestion(index);
}

function loadQuestion(index) {
    currentQuestionIndex = index;
    const question = currentQuiz.questions[index];
    
    // Update progress
    document.getElementById('currentQuestion').textContent = index + 1;
    document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;
    
    const progressPercent = ((index + 1) / currentQuiz.questions.length) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';
    
    // Update question nav grid
    document.querySelectorAll('.question-nav-btn').forEach((btn, i) => {
        btn.classList.remove('current');
        if (i === index) btn.classList.add('current');
    });
    
    // Update question content
    document.getElementById('questionTopic').textContent = question.topic;
    document.getElementById('questionText').textContent = question.question;
    
    // Show/hide image
    const imageContainer = document.getElementById('questionImageContainer');
    if (question.image) {
        document.getElementById('questionImage').src = question.image;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
    }
    
    // Render answer options
    const optionsContainer = document.getElementById('answerOptions');
    const letters = ['A', 'B', 'C', 'D'];
    
    optionsContainer.innerHTML = question.options.map((option, i) => `
        <div class="answer-option" onclick="selectAnswer(${i})">
            <input type="radio" name="answer" id="answer${i}" value="${i}" ${userAnswers[index] === i ? 'checked' : ''}>
            <label for="answer${i}">
                <span class="option-letter">${letters[i]}</span>
                <span class="option-text">${option}</span>
            </label>
        </div>
    `).join('');
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = index === 0;
    
    const isLastQuestion = index === currentQuiz.questions.length - 1;
    document.getElementById('nextBtn').style.display = isLastQuestion ? 'none' : 'flex';
    document.getElementById('submitBtn').style.display = isLastQuestion ? 'flex' : 'none';
    
    // Enable/disable next/submit based on answer
    updateNavigationButtons();
}

function selectAnswer(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update question nav button to show answered
    const navBtns = document.querySelectorAll('.question-nav-btn');
    navBtns[currentQuestionIndex].classList.add('answered');
    
    // Enable next/submit button
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const hasAnswer = userAnswers[currentQuestionIndex] !== null;
    const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
    
    if (isLastQuestion) {
        document.getElementById('submitBtn').disabled = !hasAnswer;
    } else {
        document.getElementById('nextBtn').disabled = !hasAnswer;
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
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - quizStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById('quizTimer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function submitQuiz() {
    clearInterval(timerInterval);
    
    const totalTime = Date.now() - quizStartTime;
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    
    // Calculate score
    let correctCount = 0;
    currentQuiz.questions.forEach((q, index) => {
        if (userAnswers[index] === q.correctAnswer) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / currentQuiz.questions.length) * 100);
    const incorrectCount = currentQuiz.questions.length - correctCount;
    
    // Update question nav grid with results
    document.querySelectorAll('.question-nav-btn').forEach((btn, i) => {
        btn.classList.remove('current', 'answered');
        if (userAnswers[i] === currentQuiz.questions[i].correctAnswer) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }
    });
    
    // Show results
    document.getElementById('quizInterface').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    // Update results
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('scoreRatio').textContent = `${correctCount}/${currentQuiz.questions.length}`;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('incorrectCount').textContent = incorrectCount;
    document.getElementById('totalTime').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    
    // Update score circle
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100) * circumference;
    document.getElementById('scoreCircle').style.strokeDashoffset = offset;
    
    // Update icon and message based on score
    const icon = document.getElementById('resultsIcon');
    const message = document.getElementById('resultsMessage');
    
    icon.className = 'results-icon';
    if (percentage >= 90) {
        icon.classList.add('excellent');
        icon.innerHTML = '<i class="fas fa-trophy"></i>';
        message.textContent = 'Excellent! You\'re ready for the road!';
    } else if (percentage >= 75) {
        icon.classList.add('good');
        icon.innerHTML = '<i class="fas fa-star"></i>';
        message.textContent = 'Good job! Keep practicing!';
    } else if (percentage >= 60) {
        icon.classList.add('fair');
        icon.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        message.textContent = 'Not bad! Review and try again.';
    } else {
        icon.classList.add('poor');
        icon.innerHTML = '<i class="fas fa-book"></i>';
        message.textContent = 'Keep studying! You\'ll get there.';
    }
}

function reviewAnswers() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizInterface').style.display = 'block';
    loadQuestion(0);
}

function retakeQuiz() {
    startQuiz(currentQuiz.id);
}

function backToQuizSelection() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStartScreen').style.display = 'block';
}

// ============================================
// MODE SWITCHING
// ============================================

function switchMode(mode) {
    currentMode = mode;
    
    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'content') {
        document.getElementById('contentModeBtn').classList.add('active');
        document.getElementById('dashTitle').textContent = 'Dashboard - Content Mode';
        document.getElementById('contentSidebar').classList.add('active');
        document.getElementById('qaSidebar').classList.remove('active');
        document.getElementById('contentModeView').classList.add('active');
        document.getElementById('qaModeView').classList.remove('active');
    } else {
        document.getElementById('qaModeBtn').classList.add('active');
        document.getElementById('dashTitle').textContent = 'Dashboard - Q&A Mode';
        document.getElementById('qaSidebar').classList.add('active');
        document.getElementById('contentSidebar').classList.remove('active');
        document.getElementById('qaModeView').classList.add('active');
        document.getElementById('contentModeView').classList.remove('active');
    }
    
    closeSidebar();
}

// ============================================
// UI HELPERS
// ============================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function backToWelcome() {
    document.getElementById('contentDisplay').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
    
    // Clear active states
    document.querySelectorAll('.subtopic-link').forEach(link => {
        link.classList.remove('active');
    });
}

function bookmarkContent() {
    alert('Bookmark feature coming soon!');
}

function printContent() {
    window.print();
}

function setupEventListeners() {
    // Add any additional event listeners here
}

// ============================================
// MOBILE MENU
// ============================================

function toggleMobileMenu() {
    document.querySelector('.links').classList.toggle('active');
}