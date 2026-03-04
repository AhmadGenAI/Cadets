import { db } from "./db";
import { assessmentQuestions } from "@shared/schema";

const PERSONALITY_TRAITS = [
  "SELF CONFIDENCE", "PLANNING ABILITY", "COURAGE", "EMOTIONAL STABILITY",
  "RESPONSIBILITY", "INTEGRITY", "DETERMINATION", "INITIATIVE",
  "INFLUENCING ABILITY", "SOCIAL RELATIONS", "GENERAL AWARENESS",
  "PRACTICAL ABILITY", "PHYSICAL ENDURANCE", "EXPRESSION"
];

const personalityStatements: Record<string, string[]> = {
  "SELF CONFIDENCE": [
    "I believe I can achieve anything I set my mind to.",
    "I feel comfortable speaking in front of a group.",
    "I trust my own judgment when making decisions.",
    "I can handle criticism without feeling discouraged.",
  ],
  "PLANNING ABILITY": [
    "I usually plan my day before starting work.",
    "I set clear goals before beginning any task.",
    "I manage my time effectively during exams.",
    "I prepare a proper study schedule and follow it.",
  ],
  "COURAGE": [
    "I stand up for what is right even if I am alone.",
    "I am not afraid to try new and challenging things.",
    "I can face difficult situations without backing down.",
    "I volunteer for tasks that others find scary.",
  ],
  "EMOTIONAL STABILITY": [
    "I remain calm when things don't go as planned.",
    "I don't get angry easily over small matters.",
    "I can control my emotions in stressful situations.",
    "I recover quickly from setbacks and failures.",
  ],
  "RESPONSIBILITY": [
    "I always complete my assigned tasks on time.",
    "I take responsibility for my mistakes.",
    "I follow rules even when no one is watching.",
    "I help with household chores without being asked.",
  ],
  "INTEGRITY": [
    "I always tell the truth even when it's difficult.",
    "I return things that don't belong to me.",
    "I never cheat during exams or tests.",
    "I keep my promises no matter what.",
  ],
  "DETERMINATION": [
    "I don't give up easily when facing obstacles.",
    "I keep trying until I succeed at a task.",
    "I finish what I start even when it becomes boring.",
    "I work harder when people say I cannot do something.",
  ],
  "INITIATIVE": [
    "I start working without waiting for instructions.",
    "I look for new ways to solve problems.",
    "I often come up with new ideas and suggestions.",
    "I take the lead in group activities.",
  ],
  "INFLUENCING ABILITY": [
    "I can convince others to agree with my point of view.",
    "People often listen to my suggestions.",
    "I can motivate others to work harder.",
    "I am good at explaining ideas to others clearly.",
  ],
  "SOCIAL RELATIONS": [
    "I make friends easily with new people.",
    "I enjoy working in a team with others.",
    "I am helpful and cooperative with classmates.",
    "I show respect to everyone regardless of their background.",
  ],
  "GENERAL AWARENESS": [
    "I keep up with current events and news.",
    "I know the names of important government officials.",
    "I am interested in learning about the history of Pakistan.",
    "I pay attention to what is happening in my community.",
  ],
  "PRACTICAL ABILITY": [
    "I can fix small things at home when they break.",
    "I am good at organizing my belongings neatly.",
    "I can follow instructions to build or assemble things.",
    "I manage my pocket money wisely.",
  ],
  "PHYSICAL ENDURANCE": [
    "I exercise or play sports regularly.",
    "I can run for a long distance without getting tired easily.",
    "I enjoy outdoor physical activities.",
    "I maintain good health through proper diet and exercise.",
  ],
  "EXPRESSION": [
    "I can express my thoughts clearly in writing.",
    "I can describe events or ideas in an organized manner.",
    "I participate in debates and discussions confidently.",
    "I enjoy reading and can summarize what I have read.",
  ],
};

function generateIntelligenceMcqs() {
  const qs: { questionText: string; optionsJson: any; correctAnswer: string }[] = [];
  const analogies = [
    { q: "Book is to Reading as Fork is to ___", opts: ["Writing","Eating","Drawing","Sleeping"], a: "B" },
    { q: "Eye is to See as Ear is to ___", opts: ["Walk","Hear","Taste","Touch"], a: "B" },
    { q: "Fish is to Water as Bird is to ___", opts: ["Tree","Sky","Air","Nest"], a: "C" },
    { q: "Pen is to Write as Knife is to ___", opts: ["Cut","Cook","Eat","Sharpen"], a: "A" },
    { q: "Pilot is to Airplane as Captain is to ___", opts: ["Car","Ship","Tank","Horse"], a: "B" },
    { q: "Doctor is to Hospital as Teacher is to ___", opts: ["Office","School","Library","Home"], a: "B" },
    { q: "Clock is to Time as Thermometer is to ___", opts: ["Rain","Temperature","Wind","Pressure"], a: "B" },
    { q: "Milk is to Cow as Egg is to ___", opts: ["Horse","Hen","Fish","Goat"], a: "B" },
    { q: "Night is to Day as Dark is to ___", opts: ["Black","Moon","Light","Stars"], a: "C" },
    { q: "Glove is to Hand as Shoe is to ___", opts: ["Arm","Foot","Leg","Finger"], a: "B" },
    { q: "Carpenter is to Wood as Mason is to ___", opts: ["Steel","Bricks","Paint","Glass"], a: "B" },
    { q: "Rain is to Umbrella as Sun is to ___", opts: ["Moon","Shade","Hat","Clouds"], a: "C" },
    { q: "Bee is to Hive as Bird is to ___", opts: ["Cage","Nest","Sky","Tree"], a: "B" },
    { q: "Sugar is to Sweet as Lemon is to ___", opts: ["Sour","Bitter","Salty","Spicy"], a: "A" },
    { q: "Cat is to Kitten as Dog is to ___", opts: ["Calf","Puppy","Lamb","Cub"], a: "B" },
    { q: "Mountain is to High as Valley is to ___", opts: ["Deep","Low","Wide","Narrow"], a: "B" },
    { q: "Painter is to Brush as Writer is to ___", opts: ["Paper","Book","Pen","Ink"], a: "C" },
    { q: "Iron is to Strong as Cotton is to ___", opts: ["Hard","Soft","White","Light"], a: "B" },
    { q: "Moon is to Night as Sun is to ___", opts: ["Day","Light","Morning","Sky"], a: "A" },
    { q: "Summer is to Hot as Winter is to ___", opts: ["Rain","Cold","Snow","Wind"], a: "B" },
  ];
  const series = [
    { q: "What comes next: 2, 4, 6, 8, ___", opts: ["9","10","12","11"], a: "B" },
    { q: "What comes next: 1, 3, 5, 7, ___", opts: ["8","9","10","11"], a: "B" },
    { q: "What comes next: 5, 10, 15, 20, ___", opts: ["22","25","30","24"], a: "B" },
    { q: "What comes next: 3, 6, 12, 24, ___", opts: ["30","36","48","42"], a: "C" },
    { q: "What comes next: 1, 4, 9, 16, ___", opts: ["20","25","36","21"], a: "B" },
    { q: "What comes next: 100, 90, 80, 70, ___", opts: ["65","50","60","55"], a: "C" },
    { q: "What comes next: 2, 6, 18, 54, ___", opts: ["108","162","72","96"], a: "B" },
    { q: "What comes next: 1, 1, 2, 3, 5, ___", opts: ["7","8","6","9"], a: "B" },
    { q: "What comes next: 10, 20, 30, 40, ___", opts: ["45","50","55","60"], a: "B" },
    { q: "What comes next: 7, 14, 21, 28, ___", opts: ["30","32","35","42"], a: "C" },
    { q: "What comes next: 81, 27, 9, 3, ___", opts: ["0","1","2","6"], a: "B" },
    { q: "What comes next: 4, 8, 16, 32, ___", opts: ["48","64","36","56"], a: "B" },
    { q: "What comes next: 1, 2, 4, 7, 11, ___", opts: ["14","15","16","17"], a: "C" },
    { q: "What comes next: 0, 1, 3, 6, 10, ___", opts: ["12","13","15","14"], a: "C" },
    { q: "What comes next: 2, 3, 5, 7, 11, ___", opts: ["12","13","14","15"], a: "B" },
    { q: "What comes next: 64, 32, 16, 8, ___", opts: ["6","4","2","0"], a: "B" },
    { q: "What comes next: 1, 8, 27, 64, ___", opts: ["100","125","81","216"], a: "B" },
    { q: "What comes next: 99, 88, 77, 66, ___", opts: ["44","55","50","60"], a: "B" },
    { q: "What comes next: 3, 9, 27, 81, ___", opts: ["162","243","189","324"], a: "B" },
    { q: "What comes next: 50, 45, 40, 35, ___", opts: ["25","30","20","15"], a: "B" },
  ];
  const oddOneOut = [
    { q: "Which one is different: Apple, Banana, Carrot, Mango", opts: ["Apple","Banana","Carrot","Mango"], a: "C" },
    { q: "Which one is different: Dog, Cat, Cow, Eagle", opts: ["Dog","Cat","Cow","Eagle"], a: "D" },
    { q: "Which one is different: Islamabad, Lahore, Delhi, Karachi", opts: ["Islamabad","Lahore","Delhi","Karachi"], a: "C" },
    { q: "Which one is different: Triangle, Square, Circle, Cube", opts: ["Triangle","Square","Circle","Cube"], a: "D" },
    { q: "Which one is different: Red, Blue, Bright, Green", opts: ["Red","Blue","Bright","Green"], a: "C" },
    { q: "Which one is different: Shirt, Trousers, Shoes, Jacket", opts: ["Shirt","Trousers","Shoes","Jacket"], a: "C" },
    { q: "Which one is different: Rose, Lily, Oak, Jasmine", opts: ["Rose","Lily","Oak","Jasmine"], a: "C" },
    { q: "Which one is different: Guitar, Drum, Piano, Painting", opts: ["Guitar","Drum","Piano","Painting"], a: "D" },
    { q: "Which one is different: Pakistan, India, Asia, Bangladesh", opts: ["Pakistan","India","Asia","Bangladesh"], a: "C" },
    { q: "Which one is different: Run, Walk, Sit, Jump", opts: ["Run","Walk","Sit","Jump"], a: "C" },
  ];
  const verbal = [
    { q: "Synonym of 'Brave' is:", opts: ["Coward","Courageous","Weak","Lazy"], a: "B" },
    { q: "Antonym of 'Ancient' is:", opts: ["Old","Historic","Modern","Classic"], a: "C" },
    { q: "Synonym of 'Swift' is:", opts: ["Slow","Fast","Heavy","Calm"], a: "B" },
    { q: "Antonym of 'Victory' is:", opts: ["Success","Win","Defeat","Glory"], a: "C" },
    { q: "Synonym of 'Intelligent' is:", opts: ["Foolish","Smart","Lazy","Dull"], a: "B" },
    { q: "Antonym of 'Generous' is:", opts: ["Kind","Stingy","Polite","Brave"], a: "B" },
    { q: "Synonym of 'Honest' is:", opts: ["Truthful","Clever","Lazy","Strong"], a: "A" },
    { q: "Antonym of 'Happiness' is:", opts: ["Joy","Delight","Sadness","Fun"], a: "C" },
    { q: "Synonym of 'Beautiful' is:", opts: ["Ugly","Pretty","Plain","Dull"], a: "B" },
    { q: "Antonym of 'Increase' is:", opts: ["Rise","Grow","Decrease","Expand"], a: "C" },
  ];
  [...analogies,...series,...oddOneOut,...verbal].forEach(item => {
    qs.push({ questionText: item.q, optionsJson: { A: item.opts[0], B: item.opts[1], C: item.opts[2], D: item.opts[3] }, correctAnswer: item.a });
  });
  return qs;
}

function generateEnglishMcqs() {
  const items = [
    { q: "Choose the correct spelling:", opts: ["Recieve","Receive","Receve","Receeve"], a: "B" },
    { q: "She ___ to school every day.", opts: ["go","goes","going","gone"], a: "B" },
    { q: "The plural of 'child' is:", opts: ["childs","childrens","children","childes"], a: "C" },
    { q: "Which is a noun? 'The quick brown fox jumps.'", opts: ["quick","brown","fox","jumps"], a: "C" },
    { q: "He ___ playing football since morning.", opts: ["is","was","has been","have been"], a: "C" },
    { q: "Choose the correct sentence:", opts: ["He don't like tea.","He doesn't likes tea.","He doesn't like tea.","He not like tea."], a: "C" },
    { q: "The opposite of 'strong' is:", opts: ["brave","weak","tall","heavy"], a: "B" },
    { q: "Which word is a verb?", opts: ["Beautiful","Quickly","Running","Happy"], a: "C" },
    { q: "Fill in the blank: She is ___ than her sister.", opts: ["tall","taller","tallest","more tall"], a: "B" },
    { q: "'Break' is the past tense of:", opts: ["Broke","Broken","Breaking","Breaks"], a: "A" },
    { q: "He ___ his homework before dinner.", opts: ["do","does","did","doing"], a: "C" },
    { q: "The synonym of 'happy' is:", opts: ["sad","angry","joyful","tired"], a: "C" },
    { q: "Which sentence is correct?", opts: ["I am go to school.","I goes to school.","I am going to school.","I going school."], a: "C" },
    { q: "A 'library' is a place where we:", opts: ["eat food","buy clothes","read books","play games"], a: "C" },
    { q: "Which is an adjective?", opts: ["Run","Beautiful","Quickly","Write"], a: "B" },
    { q: "She ___ her lunch already.", opts: ["eat","eats","has eaten","eating"], a: "C" },
    { q: "The feminine of 'king' is:", opts: ["prince","queen","princess","duchess"], a: "B" },
    { q: "Choose the correct article: ___ apple a day keeps the doctor away.", opts: ["A","An","The","No article"], a: "B" },
    { q: "Past tense of 'go' is:", opts: ["goed","gone","went","goes"], a: "C" },
    { q: "Which is a preposition?", opts: ["and","but","on","or"], a: "C" },
    { q: "'Quickly' is a/an:", opts: ["Noun","Adjective","Adverb","Verb"], a: "C" },
    { q: "He is ___ honest boy.", opts: ["a","an","the","no article"], a: "B" },
    { q: "She ___ not come yesterday.", opts: ["do","did","does","has"], a: "B" },
    { q: "The plural of 'mouse' is:", opts: ["mouses","mice","mices","mousies"], a: "B" },
    { q: "Which is correct?", opts: ["He play cricket.","He plays cricket.","He playing cricket.","He are playing cricket."], a: "B" },
    { q: "The meaning of 'enormous' is:", opts: ["tiny","very large","medium","beautiful"], a: "B" },
    { q: "Which is a conjunction?", opts: ["under","and","happy","run"], a: "B" },
    { q: "Choose the correct form: If I ___ rich, I would help the poor.", opts: ["am","was","were","is"], a: "C" },
    { q: "The past participle of 'write' is:", opts: ["wrote","writing","written","writed"], a: "C" },
    { q: "'Don't cry over spilt milk' means:", opts: ["Clean the milk","Don't waste milk","Don't worry about past mistakes","Milk is important"], a: "C" },
    { q: "Which word means 'a person who writes books'?", opts: ["Author","Actor","Anchor","Artist"], a: "A" },
    { q: "Fill in: They ___ friends since childhood.", opts: ["are","were","have been","has been"], a: "C" },
    { q: "The superlative of 'good' is:", opts: ["gooder","goodest","best","better"], a: "C" },
    { q: "Which sentence has correct punctuation?", opts: ["where are you going","Where are you going?","Where are you going","where are you going?"], a: "B" },
    { q: "Choose the passive voice: 'She wrote a letter.'", opts: ["A letter is written by her.","A letter was written by her.","A letter has been written.","A letter wrote she."], a: "B" },
    { q: "'He is as brave as a lion.' This is a:", opts: ["Metaphor","Simile","Personification","Hyperbole"], a: "B" },
    { q: "The collective noun for fish is:", opts: ["flock","herd","school","pack"], a: "C" },
    { q: "Which is an exclamatory sentence?", opts: ["What is your name?","Close the door.","What a beautiful day!","I like mangoes."], a: "C" },
    { q: "The meaning of 'annual' is:", opts: ["daily","weekly","monthly","yearly"], a: "D" },
    { q: "Fill in: Neither he ___ his brother came.", opts: ["or","and","nor","but"], a: "C" },
    { q: "Which word is spelled correctly?", opts: ["Tommorrow","Tommorow","Tomorrow","Tomorow"], a: "C" },
    { q: "The abbreviation 'etc.' stands for:", opts: ["et cetera","extra copy","each to copy","every chapter"], a: "A" },
    { q: "A person who repairs shoes is called a:", opts: ["carpenter","cobbler","tailor","barber"], a: "B" },
    { q: "Which is an abstract noun?", opts: ["Table","Honesty","Pen","Dog"], a: "B" },
    { q: "Fill in: The cat sat ___ the mat.", opts: ["in","at","on","of"], a: "C" },
    { q: "Which is a compound sentence?", opts: ["I like tea.","I like tea and he likes coffee.","The tall boy.","Running fast."], a: "B" },
    { q: "The antonym of 'arrive' is:", opts: ["come","reach","depart","enter"], a: "C" },
    { q: "Which word is a pronoun?", opts: ["Book","They","Beautiful","Slowly"], a: "B" },
    { q: "She asked me ___ I was feeling well.", opts: ["that","if","so","then"], a: "B" },
    { q: "Which tense: 'She will have finished by 5 PM.'?", opts: ["Future simple","Future continuous","Future perfect","Present perfect"], a: "C" },
  ];
  return items.map(item => ({ questionText: item.q, optionsJson: { A: item.opts[0], B: item.opts[1], C: item.opts[2], D: item.opts[3] }, correctAnswer: item.a }));
}

function generateScienceMcqs() {
  const items = [
    { q: "Which gas do plants absorb from the atmosphere?", opts: ["Oxygen","Nitrogen","Carbon Dioxide","Hydrogen"], a: "C" },
    { q: "The boiling point of water is:", opts: ["50°C","100°C","150°C","200°C"], a: "B" },
    { q: "Which planet is closest to the Sun?", opts: ["Venus","Earth","Mercury","Mars"], a: "C" },
    { q: "The chemical formula of water is:", opts: ["H2O","CO2","NaCl","O2"], a: "A" },
    { q: "Photosynthesis takes place in:", opts: ["Roots","Stems","Leaves","Flowers"], a: "C" },
    { q: "Which organ pumps blood in the body?", opts: ["Lungs","Liver","Heart","Kidney"], a: "C" },
    { q: "Sound travels fastest through:", opts: ["Air","Water","Vacuum","Solids"], a: "D" },
    { q: "The unit of electric current is:", opts: ["Volt","Watt","Ampere","Ohm"], a: "C" },
    { q: "Which vitamin is obtained from sunlight?", opts: ["Vitamin A","Vitamin B","Vitamin C","Vitamin D"], a: "D" },
    { q: "The largest organ of the human body is:", opts: ["Heart","Liver","Skin","Brain"], a: "C" },
    { q: "Which gas is essential for breathing?", opts: ["Nitrogen","Carbon Dioxide","Oxygen","Helium"], a: "C" },
    { q: "Magnets attract:", opts: ["Wood","Plastic","Iron","Glass"], a: "C" },
    { q: "The Earth rotates on its axis once every:", opts: ["12 hours","24 hours","48 hours","7 days"], a: "B" },
    { q: "Which of these is a conductor of electricity?", opts: ["Rubber","Plastic","Copper","Wood"], a: "C" },
    { q: "DNA stands for:", opts: ["Deoxyribonucleic Acid","Dinitrogen Acid","Dynamic Natural Acid","Dual Nucleic Atom"], a: "A" },
    { q: "The process of water changing to vapor is called:", opts: ["Condensation","Evaporation","Precipitation","Sublimation"], a: "B" },
    { q: "How many bones are in the adult human body?", opts: ["106","206","306","406"], a: "B" },
    { q: "What is the center of an atom called?", opts: ["Electron","Proton","Nucleus","Neutron"], a: "C" },
    { q: "Which animal is known as the 'Ship of the Desert'?", opts: ["Horse","Camel","Elephant","Donkey"], a: "B" },
    { q: "Newton is the unit of:", opts: ["Mass","Force","Energy","Speed"], a: "B" },
    { q: "The chemical symbol of Gold is:", opts: ["Go","Gd","Au","Ag"], a: "C" },
    { q: "Which blood cells fight against infections?", opts: ["Red blood cells","White blood cells","Platelets","Plasma"], a: "B" },
    { q: "The speed of light is approximately:", opts: ["300 km/s","3000 km/s","300,000 km/s","3,000,000 km/s"], a: "C" },
    { q: "Which is the hardest natural substance?", opts: ["Gold","Iron","Diamond","Platinum"], a: "C" },
    { q: "Acids turn litmus paper:", opts: ["Blue","Green","Red","Yellow"], a: "C" },
    { q: "The powerhouse of the cell is:", opts: ["Nucleus","Ribosome","Mitochondria","Chloroplast"], a: "C" },
    { q: "Which layer of the Earth is the thinnest?", opts: ["Core","Mantle","Crust","Outer Core"], a: "C" },
    { q: "Insulin is produced by:", opts: ["Liver","Pancreas","Kidney","Heart"], a: "B" },
    { q: "The freezing point of water in Celsius is:", opts: ["0°C","32°C","100°C","-10°C"], a: "A" },
    { q: "Which planet is known as the Red Planet?", opts: ["Jupiter","Saturn","Mars","Venus"], a: "C" },
    { q: "An ecosystem includes:", opts: ["Only living things","Only non-living things","Both living and non-living things","Only plants"], a: "C" },
    { q: "Which gas makes up most of the Earth's atmosphere?", opts: ["Oxygen","Carbon Dioxide","Nitrogen","Argon"], a: "C" },
    { q: "A thermometer measures:", opts: ["Pressure","Weight","Temperature","Speed"], a: "C" },
    { q: "The smallest unit of life is:", opts: ["Atom","Cell","Tissue","Organ"], a: "B" },
    { q: "Which force keeps us on the ground?", opts: ["Friction","Magnetic","Gravity","Electric"], a: "C" },
    { q: "Evaporation is a ___ process.", opts: ["Heating","Cooling","Both","Neither"], a: "B" },
    { q: "The chemical symbol of Iron is:", opts: ["Ir","In","Fe","Fn"], a: "C" },
    { q: "What type of energy does a battery provide?", opts: ["Mechanical","Chemical","Nuclear","Solar"], a: "B" },
    { q: "Which part of the plant absorbs water from the soil?", opts: ["Leaves","Stem","Root","Flower"], a: "C" },
    { q: "Light year is a unit of:", opts: ["Time","Speed","Distance","Weight"], a: "C" },
    { q: "The process of separating salt from water is:", opts: ["Filtration","Evaporation","Distillation","Sedimentation"], a: "C" },
    { q: "How many chambers does the human heart have?", opts: ["2","3","4","5"], a: "C" },
    { q: "Which metal is liquid at room temperature?", opts: ["Silver","Gold","Mercury","Copper"], a: "C" },
    { q: "Fungi are:", opts: ["Plants","Animals","Neither plants nor animals","Bacteria"], a: "C" },
    { q: "The ozone layer protects us from:", opts: ["Rain","Wind","UV rays","Sound"], a: "C" },
    { q: "Which is the largest planet in our solar system?", opts: ["Saturn","Neptune","Jupiter","Uranus"], a: "C" },
    { q: "The formula for common salt is:", opts: ["NaCl","KCl","CaCl2","MgCl2"], a: "A" },
    { q: "Photosynthesis requires ___ and water.", opts: ["Oxygen","Nitrogen","Sunlight","Hydrogen"], a: "C" },
    { q: "Which organ filters blood in the human body?", opts: ["Heart","Lungs","Kidney","Stomach"], a: "C" },
    { q: "Static electricity is caused by:", opts: ["Friction","Gravity","Magnetism","Heat"], a: "A" },
  ];
  return items.map(item => ({ questionText: item.q, optionsJson: { A: item.opts[0], B: item.opts[1], C: item.opts[2], D: item.opts[3] }, correctAnswer: item.a }));
}

function generateMathMcqs() {
  const items = [
    { q: "What is 15 × 12?", opts: ["170","180","190","200"], a: "B" },
    { q: "If x + 5 = 12, what is x?", opts: ["5","6","7","8"], a: "C" },
    { q: "What is the square root of 144?", opts: ["10","11","12","13"], a: "C" },
    { q: "What is 25% of 200?", opts: ["25","40","50","75"], a: "C" },
    { q: "How many degrees in a right angle?", opts: ["45°","60°","90°","180°"], a: "C" },
    { q: "What is the value of 2³?", opts: ["4","6","8","16"], a: "C" },
    { q: "The LCM of 4 and 6 is:", opts: ["8","10","12","24"], a: "C" },
    { q: "If a triangle has sides 3, 4, and 5, it is:", opts: ["Equilateral","Isosceles","Right-angled","Scalene"], a: "C" },
    { q: "What is 3/4 as a percentage?", opts: ["60%","70%","75%","80%"], a: "C" },
    { q: "Area of a rectangle with length 8 and width 5 is:", opts: ["13","26","35","40"], a: "D" },
    { q: "What is the next prime number after 7?", opts: ["8","9","10","11"], a: "D" },
    { q: "What is 1000 ÷ 25?", opts: ["20","30","40","50"], a: "C" },
    { q: "The perimeter of a square with side 6 cm is:", opts: ["12 cm","18 cm","24 cm","36 cm"], a: "C" },
    { q: "What is 0.5 × 0.5?", opts: ["0.1","0.25","0.50","1.0"], a: "B" },
    { q: "The HCF of 12 and 18 is:", opts: ["2","3","6","9"], a: "C" },
    { q: "If 2x = 10, then x = ?", opts: ["2","3","5","10"], a: "C" },
    { q: "How many sides does a hexagon have?", opts: ["4","5","6","8"], a: "C" },
    { q: "What is 7²?", opts: ["14","42","49","56"], a: "C" },
    { q: "Convert 3/5 to decimal:", opts: ["0.3","0.5","0.6","0.8"], a: "C" },
    { q: "Sum of angles in a triangle is:", opts: ["90°","120°","180°","360°"], a: "C" },
    { q: "What is 15% of 300?", opts: ["30","35","40","45"], a: "D" },
    { q: "The volume of a cube with side 3 cm is:", opts: ["9 cm³","18 cm³","27 cm³","81 cm³"], a: "C" },
    { q: "What is √81?", opts: ["7","8","9","10"], a: "C" },
    { q: "A car travels 60 km in 1 hour. Its speed is:", opts: ["30 km/h","60 km/h","90 km/h","120 km/h"], a: "B" },
    { q: "What is 5! (5 factorial)?", opts: ["20","60","100","120"], a: "D" },
    { q: "If the radius of a circle is 7, the diameter is:", opts: ["7","14","21","49"], a: "B" },
    { q: "What fraction is equivalent to 0.75?", opts: ["1/4","1/2","3/4","4/5"], a: "C" },
    { q: "The area of a circle with radius 7 is (π = 22/7):", opts: ["44","88","154","308"], a: "C" },
    { q: "What is 2/3 + 1/6?", opts: ["1/2","3/6","5/6","1"], a: "C" },
    { q: "Solve: 3x - 7 = 14", opts: ["3","5","7","21"], a: "C" },
    { q: "What is the median of 2, 5, 7, 9, 11?", opts: ["5","7","9","11"], a: "B" },
    { q: "A triangle with all equal sides is:", opts: ["Isosceles","Scalene","Equilateral","Right-angled"], a: "C" },
    { q: "What is 18 × 15?", opts: ["250","260","270","280"], a: "C" },
    { q: "How many millimeters in 1 meter?", opts: ["10","100","1000","10000"], a: "C" },
    { q: "The average of 10, 20, 30, 40 is:", opts: ["20","25","30","35"], a: "B" },
    { q: "What is (-3) × (-4)?", opts: ["-12","-7","7","12"], a: "D" },
    { q: "If a shopkeeper gives 20% discount on Rs. 500, the price is:", opts: ["Rs. 380","Rs. 400","Rs. 420","Rs. 450"], a: "B" },
    { q: "What is the circumference of a circle with radius 14? (π = 22/7)", opts: ["44","66","88","132"], a: "C" },
    { q: "Simplify: 4(2x + 3) =", opts: ["6x + 3","8x + 12","8x + 3","6x + 12"], a: "B" },
    { q: "What percentage is 45 out of 90?", opts: ["25%","40%","50%","60%"], a: "C" },
    { q: "The sum of first 10 natural numbers is:", opts: ["45","50","55","60"], a: "C" },
    { q: "How many vertices does a cube have?", opts: ["4","6","8","12"], a: "C" },
    { q: "What is 1/4 of 1 hour in minutes?", opts: ["10","15","20","25"], a: "B" },
    { q: "If angle A = 40° and angle B = 60°, angle C in a triangle is:", opts: ["60°","70°","80°","90°"], a: "C" },
    { q: "What is 10³?", opts: ["30","100","1000","10000"], a: "C" },
    { q: "Ratio of 15 to 25 is:", opts: ["1:2","2:3","3:5","5:3"], a: "C" },
    { q: "The supplement of 110° is:", opts: ["50°","60°","70°","80°"], a: "C" },
    { q: "A rectangle has length 12 and width 5. Its perimeter is:", opts: ["17","34","60","120"], a: "B" },
    { q: "What is the value of π (approximately)?", opts: ["2.14","3.14","4.14","5.14"], a: "B" },
    { q: "Solve: x/4 = 8", opts: ["2","16","24","32"], a: "D" },
  ];
  return items.map(item => ({ questionText: item.q, optionsJson: { A: item.opts[0], B: item.opts[1], C: item.opts[2], D: item.opts[3] }, correctAnswer: item.a }));
}

function generateUrduMcqs() {
  const items = [
    { q: "پاکستان کا قومی شاعر کون ہے؟", opts: ["فیض احمد فیض","علامہ اقبال","احمد فراز","میر تقی میر"], a: "B" },
    { q: "'خوشی' کا متضاد لفظ کیا ہے؟", opts: ["غم","مسرت","خوشحالی","ہنسی"], a: "A" },
    { q: "اردو کا پہلا ناول کون سا ہے؟", opts: ["امراؤ جان ادا","مراۃ العروس","توبتہ النصوح","فسانہ عجائب"], a: "B" },
    { q: "'آنکھ کا تارا' محاورے کا مطلب ہے:", opts: ["آنکھ میں تکلیف","بہت پیارا","روشنی","نظر آنا"], a: "B" },
    { q: "جملے میں فاعل کیا ہوتا ہے؟", opts: ["کام کرنے والا","جس پر کام ہو","کام","جگہ"], a: "A" },
    { q: "'سورج' کی جمع کیا ہے؟", opts: ["سورجیں","سورج","آفتاب","سورجوں"], a: "B" },
    { q: "علامہ اقبال کی مشہور نظم کون سی ہے؟", opts: ["شکوہ","لب پہ آتی ہے دعا","ہمدردی","سب سے پہلے"], a: "B" },
    { q: "'ناک میں دم کرنا' کا مطلب ہے:", opts: ["سانس لینا","بہت تنگ کرنا","ناک صاف کرنا","خوش کرنا"], a: "B" },
    { q: "'کتاب' کس زبان کا لفظ ہے؟", opts: ["فارسی","عربی","ہندی","ترکی"], a: "B" },
    { q: "'بڑا' کا متضاد کیا ہے؟", opts: ["اونچا","چھوٹا","لمبا","موٹا"], a: "B" },
    { q: "اردو زبان کی پہلی کتاب کون سی ہے؟", opts: ["سب رس","فسانہ عجائب","باغ و بہار","دیوان غالب"], a: "A" },
    { q: "'نیک' کا متضاد لفظ ہے:", opts: ["اچھا","بد","بہادر","پاک"], a: "B" },
    { q: "واحد جمع: 'ستارہ' کی جمع ہے:", opts: ["ستارے","ستاروں","سیارے","آسمان"], a: "A" },
    { q: "'ہاتھ مَلنا' محاورے کا مطلب ہے:", opts: ["ہاتھ دھونا","پچھتانا","خوش ہونا","کام کرنا"], a: "B" },
    { q: "غزل کے ہر شعر میں کتنے مصرعے ہوتے ہیں؟", opts: ["ایک","دو","تین","چار"], a: "B" },
    { q: "'پانی' کا مترادف لفظ ہے:", opts: ["آب","آگ","ہوا","مٹی"], a: "A" },
    { q: "'تیز' کا متضاد کیا ہے؟", opts: ["سست","تند","چالاک","ہوشیار"], a: "A" },
    { q: "مرزا غالب کا اصل نام کیا تھا؟", opts: ["اسد اللہ خان","محمد حسین","احمد خان","سید میر"], a: "A" },
    { q: "جملے کی قسمیں کتنی ہیں؟", opts: ["دو","تین","چار","پانچ"], a: "B" },
    { q: "'آسمان' کا مترادف لفظ ہے:", opts: ["فلک","زمین","دریا","پہاڑ"], a: "A" },
    { q: "'ٹانگ اڑانا' محاورے کا مطلب ہے:", opts: ["دوڑنا","رکاوٹ ڈالنا","کودنا","چلنا"], a: "B" },
    { q: "قائداعظم کا پورا نام کیا ہے؟", opts: ["محمد علی جناح","لیاقت علی خان","سر سید احمد","علامہ اقبال"], a: "A" },
    { q: "'سچ' کا متضاد لفظ ہے:", opts: ["حق","جھوٹ","ایمان","بات"], a: "B" },
    { q: "اردو میں حروف کی تعداد کتنی ہے؟", opts: ["36","37","38","39"], a: "C" },
    { q: "'دل' کا جمع کیا ہے؟", opts: ["دلوں","دلیں","دل","دلائل"], a: "A" },
    { q: "'خون پسینا ایک کرنا' کا مطلب ہے:", opts: ["لڑائی کرنا","بہت محنت کرنا","خون بہانا","پسینہ آنا"], a: "B" },
    { q: "نظم اور غزل میں کیا فرق ہے؟", opts: ["نظم میں ایک موضوع ہوتا ہے","غزل لمبی ہوتی ہے","دونوں ایک جیسے ہیں","کوئی فرق نہیں"], a: "A" },
    { q: "'استاد' کا مؤنث لفظ ہے:", opts: ["استادہ","استانی","معلمہ","استادنی"], a: "C" },
    { q: "'گھر' کا مترادف لفظ ہے:", opts: ["مکان","سڑک","بازار","مسجد"], a: "A" },
    { q: "'انڈے سینا' محاورے کا مطلب ہے:", opts: ["انڈے پکانا","ایک جگہ بیٹھے رہنا","پرندوں کی دیکھ بھال","خریداری"], a: "B" },
    { q: "پاکستان کا قومی ترانہ کس نے لکھا؟", opts: ["علامہ اقبال","حفیظ جالندھری","فیض احمد فیض","احمد ندیم قاسمی"], a: "B" },
    { q: "'عزت' کا متضاد لفظ ہے:", opts: ["محبت","ذلت","خوشی","طاقت"], a: "B" },
    { q: "'چاند' کا مترادف لفظ ہے:", opts: ["ماہتاب","آفتاب","ستارہ","سورج"], a: "A" },
    { q: "فعل ماضی کی مثال ہے:", opts: ["کھایا","کھاتا ہے","کھائے گا","کھا رہا ہے"], a: "A" },
    { q: "'نیند حرام کرنا' کا مطلب ہے:", opts: ["سونا","بہت پریشان کرنا","جاگنا","آرام کرنا"], a: "B" },
    { q: "'شیر' کا مؤنث لفظ ہے:", opts: ["شیرنی","شیرہ","شیرا","شیری"], a: "A" },
    { q: "اردو زبان کس خاندان سے تعلق رکھتی ہے؟", opts: ["عربی","ہند یورپی","ترکی","فارسی"], a: "B" },
    { q: "'دوست' کا جمع کیا ہے؟", opts: ["دوستوں","دوستیں","دوستان","احباب"], a: "D" },
    { q: "'آنکھیں کھلنا' محاورے کا مطلب ہے:", opts: ["جاگنا","حقیقت سمجھنا","دیکھنا","روشنی آنا"], a: "B" },
    { q: "'پھول' کا جمع ہے:", opts: ["پھولے","پھول","پھولوں","گلاب"], a: "B" },
    { q: "'علم' کا متضاد لفظ ہے:", opts: ["جہالت","عقل","سمجھ","حکمت"], a: "A" },
    { q: "مصرعے کی تعریف کیا ہے؟", opts: ["شعر کا آدھا حصہ","پوری نظم","ایک لفظ","ایک پیراگراف"], a: "A" },
    { q: "'سر پر سوار ہونا' کا مطلب ہے:", opts: ["اوپر بیٹھنا","بہت تنگ کرنا","مدد کرنا","ساتھ دینا"], a: "B" },
    { q: "'محنت' کا مترادف لفظ ہے:", opts: ["مشقت","آرام","سستی","نیند"], a: "A" },
    { q: "'بادشاہ' کا مؤنث لفظ ہے:", opts: ["بادشاہی","ملکہ","شہزادی","بیگم"], a: "B" },
    { q: "'قلم' کس زبان کا لفظ ہے؟", opts: ["فارسی","عربی","ہندی","انگریزی"], a: "B" },
    { q: "'ہوا' کا جمع ہے:", opts: ["ہوائیں","ہواؤں","ریاح","ہوایں"], a: "A" },
    { q: "'اندھیرے میں تیر چلانا' کا مطلب ہے:", opts: ["رات کو تیر اندازی","بے سوچے سمجھے کام کرنا","نشانہ لگانا","شکار کرنا"], a: "B" },
    { q: "'وطن' کا مترادف لفظ ہے:", opts: ["ملک","شہر","گاؤں","محلہ"], a: "A" },
    { q: "'لکھنا' فعل کی کون سی قسم ہے؟", opts: ["فعل لازم","فعل متعدی","فعل امر","فعل نہی"], a: "B" },
  ];
  return items.map(item => ({ questionText: item.q, optionsJson: { A: item.opts[0], B: item.opts[1], C: item.opts[2], D: item.opts[3] }, correctAnswer: item.a }));
}

export async function seedAssessmentQuestions() {
  const existing = await db.select().from(assessmentQuestions);
  if (existing.length > 0) return;

  const allQuestions: any[] = [];

  for (const [trait, statements] of Object.entries(personalityStatements)) {
    for (const stmt of statements) {
      allQuestions.push({ type: "personality", trait, questionText: stmt, optionsJson: null, correctAnswer: null, subject: null });
    }
  }

  const intelligenceQs = generateIntelligenceMcqs();
  for (const q of intelligenceQs) {
    allQuestions.push({ type: "academic", trait: null, questionText: q.questionText, optionsJson: q.optionsJson, correctAnswer: q.correctAnswer, subject: "intelligence" });
  }

  const englishQs = generateEnglishMcqs();
  for (const q of englishQs) {
    allQuestions.push({ type: "academic", trait: null, questionText: q.questionText, optionsJson: q.optionsJson, correctAnswer: q.correctAnswer, subject: "english" });
  }

  const scienceQs = generateScienceMcqs();
  for (const q of scienceQs) {
    allQuestions.push({ type: "academic", trait: null, questionText: q.questionText, optionsJson: q.optionsJson, correctAnswer: q.correctAnswer, subject: "science" });
  }

  const mathQs = generateMathMcqs();
  for (const q of mathQs) {
    allQuestions.push({ type: "academic", trait: null, questionText: q.questionText, optionsJson: q.optionsJson, correctAnswer: q.correctAnswer, subject: "math" });
  }

  const urduQs = generateUrduMcqs();
  for (const q of urduQs) {
    allQuestions.push({ type: "academic", trait: null, questionText: q.questionText, optionsJson: q.optionsJson, correctAnswer: q.correctAnswer, subject: "urdu" });
  }

  for (let i = 0; i < allQuestions.length; i += 100) {
    await db.insert(assessmentQuestions).values(allQuestions.slice(i, i + 100));
  }

  console.log(`Seeded ${allQuestions.length} assessment questions`);
}
