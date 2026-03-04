import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare, User, Users, Globe, BookOpen, Moon,
  GraduationCap, Heart, Newspaper, Brain, HelpCircle,
  Eye, Hand, Mic, Shirt, Armchair, Smile,
  CheckCircle2, XCircle, RotateCcw, Trophy
} from "lucide-react";

interface QA {
  q: string;
  a: string;
}

interface Category {
  name: string;
  icon: typeof MessageSquare;
  questions: QA[];
}

const interviewCategories: Category[] = [
  {
    name: "Self-Introduction",
    icon: User,
    questions: [
      { q: "Tell us about yourself.", a: "My name is [Name]. I am a student of class [X] at [School Name]. I live in [City] with my family. I enjoy reading, playing cricket, and learning new things. I am a disciplined and hardworking student who aims to serve Pakistan through the armed forces." },
      { q: "What is your full name and what does it mean?", a: "My full name is [Full Name]. It is an Arabic/Urdu name meaning [meaning]. My parents chose this name because they wanted me to embody these qualities." },
      { q: "How old are you?", a: "I am [age] years old. I was born on [date] in [city]." },
      { q: "Which school do you attend?", a: "I attend [School Name] in [City]. It is a well-known school that focuses on both academics and character building." },
      { q: "What class are you in?", a: "I am currently studying in class [X]. My favorite subjects are Mathematics and Science." },
      { q: "Where do you live?", a: "I live in [City/Town], which is in [Province]. It is known for [notable feature]. I have been living here since my birth." },
      { q: "What are your hobbies?", a: "My hobbies include reading books especially about history and science, playing cricket and football, and learning about technology. These hobbies help me stay active and broaden my knowledge." },
      { q: "What do you do in your free time?", a: "In my free time, I read books, help my parents with household tasks, practice physical exercises, and sometimes watch educational documentaries. I believe in using time productively." },
      { q: "What is your daily routine?", a: "I wake up early for Fajr prayer, then exercise. After breakfast, I go to school. After school, I do homework, play sports for an hour, study in the evening, and sleep early after Isha prayer." },
      { q: "What are your strengths?", a: "My strengths are discipline, punctuality, and the ability to work hard under pressure. I am also a quick learner and work well in teams." },
      { q: "What are your weaknesses?", a: "Sometimes I focus too much on details which can slow me down. However, I am working on managing my time better to overcome this." },
      { q: "Describe yourself in three words.", a: "Disciplined, determined, and respectful. These qualities define my character and guide my daily life." },
      { q: "What makes you different from other candidates?", a: "I have a strong combination of academic excellence, physical fitness, and moral values. I am also very determined and never give up on my goals." },
      { q: "What is your biggest achievement so far?", a: "My biggest achievement was [winning a competition/scoring top marks/leading a team]. It taught me the value of hard work and perseverance." },
      { q: "What motivates you every day?", a: "The desire to make my parents proud and to serve my country motivates me every day. I also want to become a role model for younger students." },
      { q: "What do you want to become in life?", a: "I want to become an officer in the Pakistan Armed Forces. I want to serve my country with honor and dedication and protect our borders." },
      { q: "What is your motto in life?", a: "My motto is 'Work hard in silence, let success make the noise.' I believe in putting in consistent effort without seeking attention." },
      { q: "How do you handle failure?", a: "I see failure as a learning opportunity. When I fail, I analyze what went wrong, learn from my mistakes, and try again with more preparation." },
      { q: "Are you a morning person or night person?", a: "I am a morning person. I wake up early for Fajr prayer and find that the morning hours are most productive for studying and exercising." },
      { q: "What book are you currently reading?", a: "I am currently reading [Book Name] by [Author]. It has taught me valuable lessons about [topic/theme]." },
      { q: "What is the most important lesson you have learned?", a: "The most important lesson I have learned is that discipline and consistency are the keys to success. Talent alone is not enough without hard work." },
      { q: "How would your friends describe you?", a: "My friends would describe me as helpful, honest, and hardworking. They know they can count on me during difficult times." },
      { q: "How would your teachers describe you?", a: "My teachers would describe me as an attentive and disciplined student who participates actively in class and always completes assignments on time." },
      { q: "What is something you are proud of?", a: "I am proud of my consistent academic performance and my ability to balance studies with sports and other activities." },
      { q: "Do you have any special talent?", a: "I am good at [public speaking/drawing/sports/reciting Quran]. I have developed this talent through regular practice and dedication." },
      { q: "What is your favorite sport?", a: "My favorite sport is cricket. It teaches teamwork, strategy, and the importance of staying calm under pressure." },
      { q: "What do you like most about yourself?", a: "I like my determination and willingness to learn. No matter how difficult a task is, I never give up and always try to improve." },
      { q: "What is your favorite food?", a: "My favorite food is biryani. It is a traditional Pakistani dish that my mother makes exceptionally well." },
      { q: "What languages do you speak?", a: "I speak Urdu, English, and [regional language]. I am also learning to improve my English communication skills." },
      { q: "Have you ever won any prize or award?", a: "Yes, I won [prize/award] in [competition/event] at [school/district level]. It was a great achievement that motivated me to work even harder." },
      { q: "What is your blood group?", a: "My blood group is [blood group]. I know this because it is important information for medical purposes." },
      { q: "What is your height and weight?", a: "My height is [X] feet [Y] inches and my weight is [Z] kg. I maintain my fitness through regular exercise and a healthy diet." },
      { q: "Do you exercise regularly?", a: "Yes, I exercise every morning. I do running, push-ups, and stretching. Physical fitness is very important for a cadet." },
      { q: "Have you ever traveled outside your city?", a: "Yes, I have visited [cities]. Traveling has helped me learn about different cultures and places in Pakistan." },
      { q: "What is your favorite color and why?", a: "My favorite color is green because it represents Pakistan's flag and symbolizes prosperity and growth." },
      { q: "What is your favorite season?", a: "My favorite season is spring because the weather is pleasant, flowers bloom, and it represents new beginnings." },
      { q: "Do you use social media?", a: "I use social media in a limited and responsible manner. I mainly use it for educational purposes and staying connected with family." },
      { q: "What would you do if you had one wish?", a: "If I had one wish, I would wish for Pakistan to become the most developed and peaceful country in the world." },
      { q: "Describe a typical day at your school.", a: "My school starts at 8 AM with assembly. We have 7 periods covering different subjects, a lunch break, and the day ends at 2 PM. We also have sports periods twice a week." },
      { q: "What is your favorite movie or TV show?", a: "I enjoy watching documentaries about military history and nature. They are both entertaining and educational." },
      { q: "Do you like reading? What kind of books?", a: "Yes, I love reading. I enjoy books about history, science, and biographies of great leaders like Quaid-e-Azam and Allama Iqbal." },
      { q: "What is your morning routine?", a: "I wake up at 5 AM, offer Fajr prayer, exercise for 30 minutes, take a bath, have breakfast, and leave for school by 7:30 AM." },
      { q: "How do you manage your time?", a: "I follow a daily schedule that divides my time between studies, sports, prayers, and rest. I prioritize important tasks and avoid wasting time." },
      { q: "What is the hardest thing you have ever done?", a: "The hardest thing I have done was preparing for this entrance test while managing school exams. It taught me the value of time management and dedication." },
      { q: "Do you help with household chores?", a: "Yes, I help my parents with household chores like cleaning my room, setting the table, and sometimes helping in the kitchen. It teaches responsibility." },
      { q: "What is your happiest memory?", a: "My happiest memory is when I [achieved something/family celebration]. It was a moment of great joy and pride for my entire family." },
      { q: "If you could meet anyone in history, who would it be?", a: "I would like to meet Quaid-e-Azam Muhammad Ali Jinnah. I would ask him about his vision for Pakistan and how young people can contribute to the nation." },
      { q: "What is your biggest dream?", a: "My biggest dream is to become a senior officer in the Pakistan Armed Forces and contribute to making Pakistan stronger and more prosperous." },
      { q: "How do you deal with stress?", a: "I deal with stress through prayer, exercise, and talking to my parents. I also take short breaks and practice deep breathing when feeling overwhelmed." },
      { q: "What would you do with a million rupees?", a: "I would invest in my education, help my family, and donate to organizations that support underprivileged children's education." },
      { q: "What do you think is the key to success?", a: "The key to success is hard work, discipline, consistency, and having faith in Allah. One must also be honest and respectful to others." },
    ],
  },
  {
    name: "Family & Background",
    icon: Users,
    questions: [
      { q: "Tell us about your family.", a: "I belong to a respectable family. My father is [occupation] and my mother is [occupation/homemaker]. I have [X] siblings. My family values education, discipline, and respect for elders." },
      { q: "What does your father do?", a: "My father is a [occupation]. He works hard to provide for our family and has always encouraged me to pursue education and serve the country." },
      { q: "What does your mother do?", a: "My mother is a [homemaker/profession]. She is the backbone of our family and has taught me the values of kindness, discipline, and hard work." },
      { q: "How many siblings do you have?", a: "I have [X] brothers and [Y] sisters. We all support each other in our studies and activities." },
      { q: "What do your siblings do?", a: "My elder brother/sister is studying [subject] at [institution]. My younger siblings are in school. We all help each other with studies." },
      { q: "What is your father's educational background?", a: "My father is a [degree] graduate from [university]. He values education highly and has always motivated us to study hard." },
      { q: "What is your mother's educational background?", a: "My mother has completed her [degree] from [institution]. She helps us with our studies and encourages us to be well-rounded individuals." },
      { q: "Who is your role model in your family?", a: "My father/mother is my role model because of their hard work, honesty, and dedication to the family. They have taught me important life values." },
      { q: "Does anyone in your family serve in the armed forces?", a: "Yes/No. [If yes: My uncle/father served in the Pakistan Army. Their service inspired me to also serve my country.] [If no: While no one in my family has served, I am deeply inspired by the sacrifices of our armed forces.]" },
      { q: "What values has your family taught you?", a: "My family has taught me honesty, respect for elders, hard work, and the importance of prayer. They have also taught me to be humble and helpful." },
      { q: "How does your family support your education?", a: "My parents provide a quiet study environment, help me with difficult subjects, and encourage me to participate in extracurricular activities." },
      { q: "What does your family think about you joining a cadet college?", a: "My family fully supports my decision. They believe that a cadet college will provide me with excellent education, discipline, and character building." },
      { q: "Who helps you with your studies at home?", a: "My father/mother/elder sibling helps me with my studies. I also have a tutor for [subject]. But I try to study independently as much as possible." },
      { q: "What is your family's monthly income?", a: "My family has a comfortable income that allows us to meet our needs. My father works diligently to support our family's requirements." },
      { q: "Where is your family originally from?", a: "My family is originally from [city/village] in [province]. We have been living in [current city] for [X] years." },
      { q: "Do you have any relatives in this cadet college?", a: "Yes/No. [If yes: My cousin/brother studied here and shared wonderful experiences about the institution.] [If no: I learned about this institution through research and recommendations.]" },
      { q: "How do you spend time with your family?", a: "We spend time together during meals, on weekends we visit relatives or go for outings, and we always gather for prayers and special occasions." },
      { q: "What is your grandfather's name and what did he do?", a: "My grandfather's name is [Name]. He was a [occupation]. He was known for his honesty and wisdom in our community." },
      { q: "Do your parents know you are appearing for this interview?", a: "Yes, my parents are fully aware and very supportive. In fact, it was with their encouragement that I applied to this cadet college." },
      { q: "What does your family do on Eid?", a: "On Eid, we offer Eid prayer together, wear new clothes, visit relatives, and share meals. We also give Eidi to younger children." },
      { q: "What is the most important lesson your parents taught you?", a: "My parents taught me that honesty and hard work are the foundations of a successful life. They always say that shortcuts lead to failure." },
      { q: "How do you help your family?", a: "I help with household chores, assist my younger siblings with their studies, and try to make my parents proud through good behavior and academic performance." },
      { q: "What does your family expect from you?", a: "My family expects me to be a good Muslim, a responsible citizen, and a hardworking student. They want me to serve my country with honor." },
      { q: "Have your parents ever been to this city?", a: "Yes/No. [Provide honest answer about family's familiarity with the city where the cadet college is located.]" },
      { q: "What is your home like?", a: "We live in a [type of house] in [area]. It is a comfortable home where all family members live together and support each other." },
      { q: "Do you live in a joint family or nuclear family?", a: "I live in a [joint/nuclear] family. [If joint: Living with grandparents and cousins has taught me patience and sharing.] [If nuclear: Our small family is very close-knit and supportive.]" },
      { q: "What traditions does your family follow?", a: "We follow Islamic traditions. We pray together, observe Ramadan, celebrate Eid, and maintain respect for elders. We also value hospitality." },
      { q: "Who is the eldest in your family?", a: "My grandfather/grandmother is the eldest in our family. They are very wise and we all respect and seek their guidance." },
      { q: "What is your family's view on discipline?", a: "My family believes discipline is essential. We follow a routine, complete tasks on time, and treat everyone with respect." },
      { q: "Has your family faced any hardships?", a: "Like every family, we have faced challenges, but we have always stayed united and worked through them together with faith in Allah." },
      { q: "What is your caste or tribe?", a: "I belong to [caste/tribe]. However, I believe that a person's character and actions are more important than their lineage." },
      { q: "What is your father's phone number?", a: "My father's contact number is [number]. He is always available and supportive of my educational pursuits." },
      { q: "How far is your home from this cadet college?", a: "My home is approximately [X] kilometers from here. The journey takes about [X] hours by [mode of transport]." },
      { q: "Will you miss your family if selected?", a: "Yes, I will miss my family, but I understand that sacrifice is part of growth. I will stay connected through letters and phone calls, and my love for serving Pakistan will keep me motivated." },
      { q: "Do your parents want you to join a cadet college?", a: "Yes, both my parents want me to join a cadet college. They believe it is the best environment for my academic and personal growth." },
      { q: "What is your family's proudest moment?", a: "Our family's proudest moment was when [describe a family achievement]. It brought us all great happiness and strengthened our bond." },
      { q: "How many people live in your house?", a: "There are [X] family members living in our house including my parents, siblings, and [grandparents if applicable]." },
      { q: "What do you eat for breakfast usually?", a: "I usually have paratha with eggs, milk, and sometimes fruit for breakfast. My mother ensures we have a nutritious start to the day." },
      { q: "Does your family have any pets?", a: "Yes/No. [If yes: We have a [pet] that teaches me responsibility.] [If no: We don't have pets but I love animals and treat them kindly.]" },
      { q: "What language is spoken at home?", a: "At home, we primarily speak [Urdu/Punjabi/Pashto/Sindhi/Balochi]. I am also comfortable communicating in Urdu and English." },
      { q: "How does your family celebrate achievements?", a: "When someone in our family achieves something, we thank Allah first, then share sweets with neighbors and relatives. My parents always encourage us." },
      { q: "What advice did your parents give you for this interview?", a: "My parents told me to be honest, speak confidently, and be myself. They said that even if I am not selected, the experience will help me grow." },
      { q: "Who dropped you here today?", a: "My [father/mother/guardian] brought me here today. They are waiting outside and are very supportive of this opportunity." },
      { q: "How did you travel here?", a: "I traveled here by [bus/car/train] from [city]. The journey took approximately [X] hours." },
      { q: "Do you share a room with your siblings?", a: "Yes/No. [Provide honest answer]. I maintain my study area neat and organized regardless of the arrangement." },
      { q: "What is your favorite family tradition?", a: "My favorite family tradition is gathering for dinner every evening and discussing our day. It keeps our family bond strong." },
      { q: "Are there any teachers in your family?", a: "Yes/No. [If yes: My [relation] is a teacher, which has instilled in me a deep respect for education.] [If no: While there are no teachers, my family greatly values education.]" },
      { q: "What is your mother's advice for difficult times?", a: "My mother always says 'Trust in Allah and keep working hard. Difficult times are temporary and they make us stronger.'" },
      { q: "Who is the most educated person in your family?", a: "The most educated person in my family is my [relation] who has a [degree] in [field]. They inspire all of us to pursue higher education." },
      { q: "How will your life change if you join this cadet college?", a: "My life will become more disciplined and structured. I will learn independence, time management, and develop both academically and physically. Most importantly, I will be on the path to serving my country." },
    ],
  },
  {
    name: "General Knowledge",
    icon: Globe,
    questions: [
      { q: "What is the capital of Pakistan?", a: "The capital of Pakistan is Islamabad. It was made the capital in 1967, replacing Karachi. Islamabad is known for its beauty and the Faisal Mosque." },
      { q: "Name all four provinces of Pakistan.", a: "The four provinces are Punjab (capital: Lahore), Sindh (capital: Karachi), Khyber Pakhtunkhwa (capital: Peshawar), and Balochistan (capital: Quetta)." },
      { q: "What are the two territories of Pakistan?", a: "Pakistan has Gilgit-Baltistan and Azad Jammu & Kashmir as territories. It also has the Islamabad Capital Territory." },
      { q: "What is the national language of Pakistan?", a: "The national language of Pakistan is Urdu. English is used as the official language for government and business purposes." },
      { q: "What is the national anthem of Pakistan called?", a: "The national anthem is called 'Qaumi Taranah'. It was written by Hafeez Jalandhari and composed by Ahmed G. Chagla. It was adopted in 1954." },
      { q: "What is the national flower of Pakistan?", a: "The national flower of Pakistan is Jasmine (Chameli). It symbolizes purity and simplicity." },
      { q: "What is the national animal of Pakistan?", a: "The national animal of Pakistan is the Markhor, a wild goat found in the mountains of northern Pakistan." },
      { q: "What is the national bird of Pakistan?", a: "The national bird of Pakistan is the Chukar Partridge (Chakor). It is found in the hilly areas of Pakistan." },
      { q: "What is the national tree of Pakistan?", a: "The national tree of Pakistan is the Deodar Cedar (Deodar). It is found in the northern areas of Pakistan." },
      { q: "What is the national sport of Pakistan?", a: "The national sport of Pakistan is Hockey. Pakistan has won multiple Olympic gold medals and World Cups in hockey." },
      { q: "What is the national game of Pakistan?", a: "The national game of Pakistan is Hockey. Pakistan's hockey team has been one of the most successful in the world." },
      { q: "Name the highest mountain in Pakistan.", a: "K2 (Mount Godwin-Austen) is the highest mountain in Pakistan and the second highest in the world at 8,611 meters." },
      { q: "Name the longest river in Pakistan.", a: "The Indus River (Darya-e-Sindh) is the longest river in Pakistan, stretching about 3,180 km. It originates from Tibet and flows into the Arabian Sea." },
      { q: "What is the largest city of Pakistan?", a: "Karachi is the largest city of Pakistan by population. It is also the economic hub and main port city of the country." },
      { q: "What is the largest province by area?", a: "Balochistan is the largest province by area, covering about 44% of Pakistan's total land area." },
      { q: "What is the largest province by population?", a: "Punjab is the largest province by population, with over 110 million people." },
      { q: "What is the currency of Pakistan?", a: "The currency of Pakistan is the Pakistani Rupee (PKR). It is issued by the State Bank of Pakistan." },
      { q: "Who designed the Pakistani flag?", a: "The Pakistani flag was designed by Syed Amir-ud-Din Kidwai. The green represents the Muslim majority, white represents minorities, the crescent represents progress, and the star represents light and knowledge." },
      { q: "What do the colors of the Pakistani flag represent?", a: "Green represents the Muslim majority, white represents religious minorities, the crescent symbolizes progress, and the five-pointed star represents light and knowledge." },
      { q: "What are the neighboring countries of Pakistan?", a: "Pakistan's neighbors are China (north), India (east), Afghanistan (west and north), and Iran (southwest). The Arabian Sea is to the south." },
      { q: "Name the major deserts of Pakistan.", a: "Major deserts are Thar Desert (Sindh), Cholistan Desert (Punjab), Thal Desert (Punjab), and Kharan Desert (Balochistan)." },
      { q: "Name five important cities of Pakistan.", a: "Five important cities are Islamabad (capital), Karachi (economic hub), Lahore (cultural capital), Peshawar (historic city), and Quetta (Balochistan capital)." },
      { q: "What is the total area of Pakistan?", a: "Pakistan's total area is approximately 881,913 square kilometers, making it the 33rd largest country in the world." },
      { q: "What is the approximate population of Pakistan?", a: "Pakistan's population is approximately 230 million, making it the 5th most populous country in the world." },
      { q: "Which oceans/seas border Pakistan?", a: "The Arabian Sea borders Pakistan to the south. Pakistan's coastline is approximately 1,046 kilometers long." },
      { q: "What are the major ports of Pakistan?", a: "The major ports are Karachi Port, Port Qasim (near Karachi), and Gwadar Port (Balochistan). Gwadar is being developed under CPEC." },
      { q: "What is CPEC?", a: "CPEC stands for China-Pakistan Economic Corridor. It is a collection of infrastructure projects connecting Gwadar Port to China's Xinjiang region, worth approximately $62 billion." },
      { q: "What is the United Nations?", a: "The United Nations (UN) is an international organization founded in 1945 to maintain world peace, promote human rights, and foster cooperation among nations. Pakistan joined the UN in 1947." },
      { q: "What is NATO?", a: "NATO stands for North Atlantic Treaty Organization. It is a military alliance of Western countries formed in 1949 for collective defense." },
      { q: "What is the OIC?", a: "OIC stands for Organisation of Islamic Cooperation. It has 57 member states and works to safeguard the interests of the Muslim world. Pakistan is an active member." },
      { q: "What is the full form of WHO?", a: "WHO stands for World Health Organization. It is a specialized agency of the United Nations responsible for international public health." },
      { q: "What is the full form of UNESCO?", a: "UNESCO stands for United Nations Educational, Scientific and Cultural Organization. It works to promote education, science, and culture worldwide." },
      { q: "Name the continents of the world.", a: "The seven continents are Asia, Africa, North America, South America, Antarctica, Europe, and Australia/Oceania. Asia is the largest." },
      { q: "Name the five oceans.", a: "The five oceans are the Pacific Ocean, Atlantic Ocean, Indian Ocean, Southern Ocean, and Arctic Ocean. The Pacific is the largest." },
      { q: "What is global warming?", a: "Global warming is the gradual increase in Earth's average temperature due to greenhouse gases like carbon dioxide. It causes climate change, melting ice caps, and rising sea levels." },
      { q: "What is the solar system?", a: "The solar system consists of the Sun and everything that orbits around it, including 8 planets, dwarf planets, asteroids, and comets. Earth is the third planet from the Sun." },
      { q: "Name all eight planets.", a: "The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Jupiter is the largest and Mercury is the smallest." },
      { q: "What is the largest country in the world by area?", a: "Russia is the largest country by area, covering about 17.1 million square kilometers." },
      { q: "What is the smallest country in the world?", a: "Vatican City is the smallest country in the world, with an area of about 0.44 square kilometers." },
      { q: "What is the largest ocean?", a: "The Pacific Ocean is the largest ocean, covering about 165.25 million square kilometers, which is larger than all the land area combined." },
      { q: "What is the longest wall in the world?", a: "The Great Wall of China is the longest wall, stretching over 21,000 kilometers. It was built to protect against invasions." },
      { q: "What is the tallest building in the world?", a: "The Burj Khalifa in Dubai, UAE, is the tallest building at 828 meters (2,717 feet) with 163 floors." },
      { q: "What is the speed of light?", a: "The speed of light is approximately 300,000 kilometers per second (3 x 10^8 m/s). Light from the Sun takes about 8 minutes to reach Earth." },
      { q: "What is the boiling point of water?", a: "The boiling point of water is 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure." },
      { q: "What is the freezing point of water?", a: "The freezing point of water is 0 degrees Celsius (32 degrees Fahrenheit) at standard atmospheric pressure." },
      { q: "What is photosynthesis?", a: "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to produce food (glucose) and oxygen. It occurs in the chloroplasts of plant cells." },
      { q: "What is gravity?", a: "Gravity is a natural force that attracts objects toward each other. On Earth, it pulls everything toward the center. It was famously described by Sir Isaac Newton." },
      { q: "Who invented the telephone?", a: "Alexander Graham Bell invented the telephone in 1876. It revolutionized communication worldwide." },
      { q: "Who invented the light bulb?", a: "Thomas Edison invented the practical incandescent light bulb in 1879. It transformed how people live and work." },
      { q: "Who invented the computer?", a: "Charles Babbage is known as the father of the computer. He designed the first mechanical computer called the Analytical Engine in the 1830s." },
      { q: "What is the Internet?", a: "The Internet is a global network of computers that allows people to share information, communicate, and access services worldwide. It was developed in the late 20th century." },
      { q: "What is democracy?", a: "Democracy is a system of government where the people elect their representatives through voting. It comes from the Greek word meaning 'rule by the people.'" },
      { q: "What is the difference between weather and climate?", a: "Weather refers to short-term atmospheric conditions (daily/weekly), while climate refers to the average weather conditions of an area over a long period (30+ years)." },
      { q: "What causes earthquakes?", a: "Earthquakes are caused by the movement of tectonic plates beneath the Earth's surface. When these plates collide, slide, or move apart, it releases energy as seismic waves." },
      { q: "What is the water cycle?", a: "The water cycle is the continuous movement of water through evaporation, condensation, precipitation, and collection. It ensures fresh water is available on Earth." },
    ],
  },
  {
    name: "Pakistan Studies",
    icon: BookOpen,
    questions: [
      { q: "When was Pakistan created?", a: "Pakistan was created on 14th August 1947. It was carved out of British India as a separate homeland for Muslims of the subcontinent." },
      { q: "Who is the founder of Pakistan?", a: "Quaid-e-Azam Muhammad Ali Jinnah is the founder of Pakistan. He led the Pakistan Movement and served as the first Governor-General." },
      { q: "What was the Pakistan Movement?", a: "The Pakistan Movement was a political movement in British India that sought to create a separate Muslim state. It was led by the All-India Muslim League under Quaid-e-Azam." },
      { q: "What was the Two-Nation Theory?", a: "The Two-Nation Theory stated that Hindus and Muslims were two separate nations with different religions, cultures, and traditions, and therefore needed separate homelands." },
      { q: "When and where was the Pakistan Resolution passed?", a: "The Pakistan Resolution (Lahore Resolution) was passed on 23rd March 1940 at Minto Park (now Iqbal Park), Lahore. It demanded a separate state for Muslims." },
      { q: "Who presented the Pakistan Resolution?", a: "The Pakistan Resolution was presented by A.K. Fazlul Haq (Sher-e-Bangal) on 23rd March 1940 at the annual session of the Muslim League in Lahore." },
      { q: "Who was the first Prime Minister of Pakistan?", a: "Liaquat Ali Khan was the first Prime Minister of Pakistan. He served from 1947 until his assassination in 1951." },
      { q: "Who was the first President of Pakistan?", a: "Iskander Mirza was the first President of Pakistan, serving from 1956 to 1958." },
      { q: "What is the Objectives Resolution?", a: "The Objectives Resolution was passed on 12th March 1949. It laid down the basic principles for Pakistan's future constitution, declaring that sovereignty belongs to Allah." },
      { q: "When was the first constitution of Pakistan made?", a: "The first constitution of Pakistan was adopted on 23rd March 1956. It declared Pakistan an Islamic Republic." },
      { q: "What happened on 16th December 1971?", a: "On 16th December 1971, East Pakistan separated and became Bangladesh after a war involving Pakistan, India, and Bengali nationalists. It was a very sad event in our history." },
      { q: "Who is Allama Muhammad Iqbal?", a: "Allama Iqbal (1877-1938) was the national poet of Pakistan. He envisioned a separate Muslim state in his famous Allahabad Address of 1930. He inspired the Pakistan Movement." },
      { q: "What is the Allahabad Address?", a: "The Allahabad Address was given by Allama Iqbal on 29th December 1930 at the annual session of the Muslim League. He proposed the idea of a separate Muslim state in northwest India." },
      { q: "What is Pakistan Day?", a: "Pakistan Day is celebrated on 23rd March to commemorate the Lahore Resolution of 1940 and the adoption of the first constitution in 1956." },
      { q: "What is Independence Day?", a: "Independence Day is celebrated on 14th August to mark Pakistan's independence from British rule in 1947." },
      { q: "What is Defence Day?", a: "Defence Day is observed on 6th September to honor the soldiers who defended Pakistan during the 1965 war against India." },
      { q: "When did the 1965 war happen?", a: "The 1965 war between Pakistan and India started on 6th September 1965. Pakistan's armed forces bravely defended the country. Major Aziz Bhatti was a hero of this war." },
      { q: "Who was Major Aziz Bhatti?", a: "Major Raja Aziz Bhatti (Shaheed) was a Pakistan Army officer who received the Nishan-e-Haider for his bravery in the 1965 war. He defended the BRB Canal sector." },
      { q: "What is the Nishan-e-Haider?", a: "Nishan-e-Haider is Pakistan's highest military award for bravery. It has been awarded to 10 soldiers, all posthumously. 'Haider' refers to Hazrat Ali (R.A)." },
      { q: "Name some Nishan-e-Haider recipients.", a: "Recipients include Major Aziz Bhatti, Major Tufail Muhammad, Captain Sarwar Shaheed, Havildar Lalak Jan, Captain Karnal Sher Khan, and others. All received it posthumously." },
      { q: "What is the Karakoram Highway?", a: "The Karakoram Highway (KKH) connects Pakistan to China through the Karakoram mountain range. It is one of the highest paved international roads in the world." },
      { q: "What is the significance of Gwadar Port?", a: "Gwadar Port in Balochistan is a deep-sea port being developed under CPEC. It will serve as a major trade hub connecting China to the Arabian Sea and boosting Pakistan's economy." },
      { q: "What is the Indus Water Treaty?", a: "The Indus Water Treaty was signed in 1960 between Pakistan and India, mediated by the World Bank. It divides the use of rivers between the two countries." },
      { q: "Name the important passes of Pakistan.", a: "Important passes include Khyber Pass (connecting Pakistan-Afghanistan), Bolan Pass (Balochistan), Khunjerab Pass (Pakistan-China border), and Lowari Pass (Dir-Chitral)." },
      { q: "What is Mohenjo-daro?", a: "Mohenjo-daro is an ancient city of the Indus Valley Civilization located in Sindh, Pakistan. It dates back to 2500 BCE and is a UNESCO World Heritage Site." },
      { q: "What is Taxila?", a: "Taxila (Takshashila) is an ancient city in Punjab, Pakistan. It was a famous center of Buddhist learning and is a UNESCO World Heritage Site." },
      { q: "What are Pakistan's major crops?", a: "Pakistan's major crops include wheat, rice, cotton, sugarcane, and maize. Agriculture contributes significantly to Pakistan's economy and employs about 40% of the labor force." },
      { q: "What are Pakistan's major industries?", a: "Major industries include textiles, cement, steel, chemicals, fertilizers, food processing, and sports goods. Sialkot is famous for sports goods manufacturing." },
      { q: "What is the State Bank of Pakistan?", a: "The State Bank of Pakistan (SBP) is the central bank of Pakistan, established on 1st July 1948. It regulates the monetary and credit system of the country." },
      { q: "Who wrote the national anthem of Pakistan?", a: "The lyrics of Pakistan's national anthem were written by Hafeez Jalandhari and the music was composed by Ahmed G. Chagla. It was officially adopted on 13th August 1954." },
      { q: "What is the motto of Pakistan?", a: "Pakistan's motto is 'Iman, Ittehad, Tanzeem' (Faith, Unity, Discipline). This was given by Quaid-e-Azam Muhammad Ali Jinnah." },
      { q: "What is the Pakistan Atomic Energy Commission?", a: "PAEC (Pakistan Atomic Energy Commission) was established in 1956. Pakistan became a nuclear power on 28th May 1998 when it conducted nuclear tests at Chagai, Balochistan." },
      { q: "When did Pakistan become a nuclear power?", a: "Pakistan conducted its nuclear tests on 28th May 1998 at Chagai Hills, Balochistan, becoming the 7th nuclear power in the world and the first in the Muslim world." },
      { q: "Who is Dr. Abdul Qadeer Khan?", a: "Dr. Abdul Qadeer Khan was a Pakistani nuclear physicist known as the father of Pakistan's nuclear program. He played a key role in making Pakistan a nuclear power." },
      { q: "What are the major dams of Pakistan?", a: "Major dams include Tarbela Dam (largest earth-filled dam), Mangla Dam, Warsak Dam, and Diamer-Bhasha Dam (under construction). They provide water for irrigation and generate electricity." },
      { q: "What is the Pakistan Resolution also known as?", a: "The Pakistan Resolution is also known as the Lahore Resolution because it was passed in Lahore on 23rd March 1940." },
      { q: "Who was the last Viceroy of British India?", a: "Lord Mountbatten was the last Viceroy of British India. He oversaw the partition of India and the creation of Pakistan in 1947." },
      { q: "What is the Wagah Border?", a: "The Wagah Border is the border crossing between Pakistan (Lahore) and India (Amritsar). It is famous for the daily flag-lowering ceremony performed by both countries' border guards." },
      { q: "What are the important mountains of Pakistan?", a: "Important mountains include K2 (8,611m), Nanga Parbat (8,126m), Rakaposhi, Tirich Mir, and Gasherbrum. Pakistan has some of the highest peaks in the world." },
      { q: "Name the major rivers of Pakistan.", a: "The major rivers are Indus, Jhelum, Chenab, Ravi, Sutlej, and Kabul. The Indus is the longest and most important river." },
      { q: "What is the significance of 23rd March?", a: "23rd March is Pakistan Day, commemorating the Lahore Resolution of 1940 when Muslims demanded a separate homeland, and the adoption of Pakistan's first constitution in 1956." },
      { q: "What is the Line of Control (LoC)?", a: "The Line of Control is the de facto border between Pakistan-administered Kashmir and Indian-administered Kashmir. It was established after the 1972 Simla Agreement." },
      { q: "What is the Kashmir issue?", a: "Kashmir is a disputed territory between Pakistan and India since 1947. The people of Kashmir have been denied their right to self-determination as promised by UN resolutions." },
      { q: "What are Pakistan's nuclear test sites?", a: "Pakistan conducted nuclear tests at Chagai Hills and Ras Koh in Balochistan on 28th and 30th May 1998." },
      { q: "What is the Pakistan flag's design?", a: "The flag has a dark green background with a white vertical stripe on the left. A white crescent and five-pointed star are on the green portion." },
      { q: "What is the national day of Pakistan?", a: "Pakistan has two major national days: 14th August (Independence Day) and 23rd March (Pakistan Day/Republic Day)." },
      { q: "Name some famous poets of Pakistan.", a: "Famous poets include Allama Iqbal (national poet), Faiz Ahmed Faiz, Ahmed Faraz, Habib Jalib, and Parveen Shakir." },
      { q: "What is the Pakistan Military Academy?", a: "PMA Kakul is located in Abbottabad and trains officers for the Pakistan Army. It was established in 1947 and is one of the most prestigious military academies." },
      { q: "What are Pakistan's armed forces?", a: "Pakistan has three branches of armed forces: Pakistan Army (land), Pakistan Navy (sea), and Pakistan Air Force (air). The Chief of Army Staff is the head of the Army." },
      { q: "What is the Pakistan Air Force Academy?", a: "PAF Academy Asghar Khan (formerly Risalpur) trains officers for the Pakistan Air Force. It is located in Risalpur, KPK." },
      { q: "What is the Pakistan Naval Academy?", a: "PNA is located in Karachi and trains officers for the Pakistan Navy. It provides comprehensive naval training." },
    ],
  },
  {
    name: "Islamic Knowledge",
    icon: Moon,
    questions: [
      { q: "How many pillars of Islam are there? Name them.", a: "There are 5 pillars of Islam: 1) Shahada (Declaration of Faith), 2) Salah (Prayer - 5 times daily), 3) Zakat (Charity - 2.5% of savings), 4) Sawm (Fasting in Ramadan), 5) Hajj (Pilgrimage to Makkah)." },
      { q: "What is the Kalima Tayyaba?", a: "Kalima Tayyaba is: 'La ilaha illallah, Muhammadur Rasulullah' meaning 'There is no god but Allah, Muhammad (PBUH) is the messenger of Allah.' It is the first pillar of Islam." },
      { q: "How many Surahs are in the Holy Quran?", a: "There are 114 Surahs (chapters) in the Holy Quran. The longest is Surah Al-Baqarah and the shortest is Surah Al-Kawthar." },
      { q: "What is the first Surah of the Quran?", a: "The first Surah is Surah Al-Fatiha (The Opening). It has 7 verses and is recited in every unit of prayer." },
      { q: "What is the last Surah of the Quran?", a: "The last Surah is Surah An-Nas (Mankind). It seeks Allah's protection from evil." },
      { q: "How many Paras (Juz) are in the Quran?", a: "There are 30 Paras (Juz) in the Holy Quran." },
      { q: "What is the holy book of Muslims?", a: "The holy book of Muslims is the Quran. It was revealed to Prophet Muhammad (PBUH) over a period of 23 years through Angel Jibreel (Gabriel)." },
      { q: "Who was the last Prophet of Islam?", a: "Prophet Muhammad (PBUH) was the last and final Prophet of Islam. He was born in Makkah in 570 CE and passed away in Madinah in 632 CE." },
      { q: "Where was Prophet Muhammad (PBUH) born?", a: "Prophet Muhammad (PBUH) was born in Makkah, Saudi Arabia, in 570 CE (the Year of the Elephant)." },
      { q: "What was the Prophet's (PBUH) father's name?", a: "The Prophet's (PBUH) father's name was Abdullah. He passed away before the Prophet (PBUH) was born." },
      { q: "What was the Prophet's (PBUH) mother's name?", a: "The Prophet's (PBUH) mother's name was Amina. She passed away when the Prophet (PBUH) was about 6 years old." },
      { q: "How many times do Muslims pray daily?", a: "Muslims pray 5 times daily: Fajr (dawn), Zuhr (afternoon), Asr (late afternoon), Maghrib (sunset), and Isha (night)." },
      { q: "What is Ramadan?", a: "Ramadan is the 9th month of the Islamic calendar during which Muslims fast from dawn to sunset. It is the month in which the Quran was first revealed." },
      { q: "What is Hajj?", a: "Hajj is the annual Islamic pilgrimage to Makkah, Saudi Arabia. It is obligatory for every Muslim who is physically and financially able, at least once in their lifetime." },
      { q: "What is Zakat?", a: "Zakat is the obligatory charity in Islam. Muslims must give 2.5% of their annual savings to the poor and needy. It purifies wealth and helps reduce poverty." },
      { q: "What are the two main Eids?", a: "The two main Eids are Eid-ul-Fitr (celebrating the end of Ramadan) and Eid-ul-Adha (commemorating Prophet Ibrahim's willingness to sacrifice his son)." },
      { q: "What is the Kaaba?", a: "The Kaaba is the sacred cube-shaped building in Masjid al-Haram, Makkah. It was built by Prophet Ibrahim (AS) and his son Ismail (AS). Muslims face it during prayers." },
      { q: "What is the first revelation of the Quran?", a: "The first revelation was 'Iqra' (Read) from Surah Al-Alaq. It was revealed to Prophet Muhammad (PBUH) in the Cave of Hira through Angel Jibreel." },
      { q: "Name four Holy Books mentioned in the Quran.", a: "The four holy books are: Torah (revealed to Prophet Musa/Moses), Zabur/Psalms (Prophet Dawud/David), Injeel/Gospel (Prophet Isa/Jesus), and Quran (Prophet Muhammad PBUH)." },
      { q: "How many articles of faith are there in Islam?", a: "There are 6 articles of faith: Belief in Allah, His Angels, His Books, His Prophets, the Day of Judgment, and Predestination (Taqdeer)." },
      { q: "What is Shab-e-Qadr?", a: "Shab-e-Qadr (Night of Power) is a blessed night in Ramadan, better than a thousand months. The Quran was first revealed on this night. It falls in the last 10 days of Ramadan." },
      { q: "What is the significance of Friday in Islam?", a: "Friday (Jumu'ah) is the most important day of the week for Muslims. It is obligatory for Muslim men to attend Jumu'ah prayer in congregation at the mosque." },
      { q: "Who are the four Caliphs of Islam?", a: "The four Rightly Guided Caliphs (Khulafa-e-Rashideen) are: 1) Hazrat Abu Bakr (RA), 2) Hazrat Umar (RA), 3) Hazrat Usman (RA), 4) Hazrat Ali (RA)." },
      { q: "What is Sadaqah?", a: "Sadaqah is voluntary charity in Islam. Unlike Zakat which is obligatory, Sadaqah can be given in any amount at any time. Even a smile is considered Sadaqah." },
      { q: "What is Sunnah?", a: "Sunnah refers to the practices, sayings, and approvals of Prophet Muhammad (PBUH). Following the Sunnah is highly encouraged in Islam." },
      { q: "What is Hadith?", a: "Hadith is a record of the sayings, actions, and approvals of Prophet Muhammad (PBUH). Major Hadith collections include Sahih Bukhari and Sahih Muslim." },
      { q: "What is the importance of Masjid-e-Nabawi?", a: "Masjid-e-Nabawi (Prophet's Mosque) is in Madinah, Saudi Arabia. It was built by Prophet Muhammad (PBUH) and contains his tomb. It is the second holiest mosque in Islam." },
      { q: "What are the three holiest mosques in Islam?", a: "The three holiest mosques are: 1) Masjid al-Haram (Makkah), 2) Masjid-e-Nabawi (Madinah), 3) Masjid al-Aqsa (Jerusalem)." },
      { q: "What is Wudu?", a: "Wudu (ablution) is the Islamic practice of washing specific body parts before prayer. It includes washing hands, mouth, nose, face, arms, wiping the head, and washing feet." },
      { q: "What is the meaning of 'Islam'?", a: "Islam means 'submission to the will of Allah' and also 'peace.' A Muslim is one who submits to Allah's will and lives in peace with others." },
      { q: "Recite any short Surah.", a: "Surah Al-Ikhlas: 'Qul huwa Allahu ahad, Allahus samad, Lam yalid wa lam yulad, Wa lam yakun lahu kufuwan ahad.' (Say: He is Allah, the One. Allah, the Eternal. He neither begets nor was begotten. And there is none comparable to Him.)" },
      { q: "What is the month of Muharram?", a: "Muharram is the first month of the Islamic calendar. The 10th of Muharram (Ashura) is significant as Prophet Musa (AS) was saved from Pharaoh, and Hazrat Imam Hussain (RA) was martyred at Karbala." },
      { q: "What is Isra and Miraj?", a: "Isra and Miraj refers to Prophet Muhammad's (PBUH) miraculous night journey from Makkah to Jerusalem (Isra) and then ascension to the heavens (Miraj). The five daily prayers were prescribed during this journey." },
      { q: "Name five Prophets mentioned in the Quran.", a: "Five Prophets include: Adam (AS), Ibrahim/Abraham (AS), Musa/Moses (AS), Isa/Jesus (AS), and Muhammad (PBUH). The Quran mentions 25 Prophets by name." },
      { q: "What is Taqwa?", a: "Taqwa means God-consciousness or piety. It is the awareness of Allah in everything we do, avoiding sins, and performing good deeds." },
      { q: "What is Dua?", a: "Dua is a personal prayer or supplication to Allah. Muslims can make Dua at any time, asking Allah for guidance, help, forgiveness, or anything they need." },
      { q: "What does 'Bismillah' mean?", a: "Bismillah means 'In the name of Allah.' Muslims say it before starting any task, eating food, or beginning any important activity." },
      { q: "What does 'Alhamdulillah' mean?", a: "Alhamdulillah means 'All praise is due to Allah.' Muslims say it to express gratitude for blessings and after completing tasks." },
      { q: "What does 'InshaAllah' mean?", a: "InshaAllah means 'If Allah wills.' Muslims say it when expressing hope or intention to do something in the future." },
      { q: "What does 'MashaAllah' mean?", a: "MashaAllah means 'As Allah has willed.' It is said to express appreciation and acknowledge that all good things come from Allah." },
      { q: "What is the importance of honesty in Islam?", a: "Honesty (Sidq) is a fundamental virtue in Islam. Prophet Muhammad (PBUH) was known as As-Sadiq (The Truthful). Islam teaches that honesty leads to righteousness and Paradise." },
      { q: "What does the Quran say about parents?", a: "The Quran commands Muslims to treat parents with utmost respect and kindness. In Surah Al-Isra (17:23-24), Allah says to be kind to parents and not even say 'uff' to them." },
      { q: "What is the Islamic greeting?", a: "The Islamic greeting is 'Assalamu Alaikum' meaning 'Peace be upon you.' The reply is 'Wa Alaikum Assalam' meaning 'And upon you be peace.'" },
      { q: "What is Ihsan?", a: "Ihsan means excellence in worship. Prophet Muhammad (PBUH) defined it as 'worshipping Allah as if you see Him, and if you cannot see Him, then know that He sees you.'" },
      { q: "What is the significance of the month of Shaban?", a: "Shaban is the 8th month of the Islamic calendar. The 15th night (Shab-e-Barat) is considered a blessed night. It is also the month when the Qibla was changed from Jerusalem to Makkah." },
      { q: "What is Jihad?", a: "Jihad means 'striving' or 'struggle.' The greatest Jihad is the struggle against one's own bad desires (Jihad-e-Nafs). It also means defending one's country and faith when necessary." },
      { q: "What are the rights of neighbors in Islam?", a: "Islam emphasizes being kind to neighbors. Prophet Muhammad (PBUH) said that Angel Jibreel kept advising about neighbors until he thought neighbors would be given a share in inheritance." },
      { q: "What is Azan?", a: "Azan is the Islamic call to prayer, called out from the mosque five times a day to inform Muslims that it is time for prayer. Hazrat Bilal (RA) was the first Muazzin." },
      { q: "What is the importance of seeking knowledge in Islam?", a: "Seeking knowledge is obligatory in Islam. Prophet Muhammad (PBUH) said: 'Seek knowledge from the cradle to the grave.' Islam encourages both religious and worldly knowledge." },
      { q: "What is Sabr (patience)?", a: "Sabr means patience and perseverance in Islam. The Quran says 'Indeed, Allah is with the patient' (2:153). It is one of the most valued qualities in Islam." },
    ],
  },
  {
    name: "Cadet College Specific",
    icon: GraduationCap,
    questions: [
      { q: "Why do you want to join a cadet college?", a: "I want to join a cadet college because it provides excellent academic education combined with military training and character building. It will prepare me to serve my country as a disciplined and capable leader." },
      { q: "What do you know about this cadet college?", a: "This cadet college was established in [year] and is known for producing outstanding officers for Pakistan's armed forces. It provides quality education along with physical training and moral development." },
      { q: "How did you hear about this cadet college?", a: "I learned about this cadet college through [source - family member/teacher/media]. After researching its achievements and alumni, I became determined to seek admission here." },
      { q: "What is the difference between a cadet college and a regular school?", a: "A cadet college provides military-style discipline, physical training, and structured living in addition to academics. Students live in hostels, follow strict routines, and develop leadership qualities." },
      { q: "Are you ready to live away from your family?", a: "Yes, I am mentally prepared to live away from my family. I understand that this sacrifice is necessary for my growth and development. I will stay connected through letters and calls." },
      { q: "Can you wake up early in the morning?", a: "Yes, I already wake up early for Fajr prayer. I am used to an early morning routine and understand that discipline starts with waking up early." },
      { q: "Are you physically fit?", a: "Yes, I exercise regularly and participate in sports. I can run, do push-ups, and participate in various physical activities. I am prepared for the physical training at the cadet college." },
      { q: "Can you follow strict rules and discipline?", a: "Yes, I believe in discipline and following rules. At home and school, I follow routines and respect rules. I am ready for the structured environment of a cadet college." },
      { q: "What will you do if you feel homesick?", a: "If I feel homesick, I will focus on my studies and activities, make friends, and remember that this temporary separation will help me achieve my bigger goals. I will also pray for strength." },
      { q: "What if you are not selected?", a: "If I am not selected, I will not be discouraged. I will work harder, improve my weak areas, and try again. Every experience is a learning opportunity." },
      { q: "Do you know any student who studies here?", a: "Yes/No. [If yes: I know [name] who studies here and has shared positive experiences about the college.] [If no: I have researched the college thoroughly and am impressed by its reputation.]" },
      { q: "What do you think life in a cadet college is like?", a: "Life in a cadet college is disciplined and structured. It includes early wake-ups, physical training, academics, sports, and character-building activities. It is challenging but rewarding." },
      { q: "What subjects are you good at?", a: "I am good at [subjects]. I consistently score well in these subjects and enjoy studying them. I also work hard on subjects I find challenging." },
      { q: "What subjects do you find difficult?", a: "I find [subject] challenging, but I am working hard to improve. I seek help from teachers and practice regularly to overcome my weaknesses." },
      { q: "Can you swim?", a: "Yes/No. [If yes: I can swim and enjoy it.] [If no: I have not had the opportunity to learn yet, but I am eager and willing to learn swimming at the cadet college.]" },
      { q: "Have you ever lived in a hostel?", a: "Yes/No. [If yes: I have hostel experience and know how to live independently.] [If no: While I haven't lived in a hostel before, I am prepared to adapt and learn to live independently.]" },
      { q: "What qualities should a cadet have?", a: "A cadet should have discipline, honesty, courage, physical fitness, respect for others, leadership abilities, patriotism, and a strong sense of responsibility." },
      { q: "What is the role of discipline in a cadet's life?", a: "Discipline is the foundation of a cadet's life. It helps in time management, builds character, develops self-control, and prepares cadets for the structured life in the armed forces." },
      { q: "What will you contribute to this cadet college?", a: "I will contribute my dedication, hard work, and positive attitude. I will participate actively in academics, sports, and co-curricular activities. I will be a good team member and help my fellow cadets." },
      { q: "Do you know the motto of this cadet college?", a: "[Research the specific motto of the cadet college before the interview]. The motto reflects the values and mission of the institution." },
      { q: "What do you think is the most challenging part of cadet life?", a: "I think being away from family and adjusting to the strict routine will be the most challenging initially. However, I am prepared for these challenges and see them as opportunities for growth." },
      { q: "Are you a team player or do you prefer working alone?", a: "I am a team player who can also work independently when needed. I believe teamwork is essential in military life and I enjoy collaborating with others to achieve common goals." },
      { q: "Can you handle physical punishment or tough training?", a: "I understand that tough training is part of building resilience and character. I am mentally and physically prepared to handle challenging training with a positive attitude." },
      { q: "What sports can you play?", a: "I can play cricket, football, and badminton. I also participate in athletics. I am ready to learn any new sport that is part of the cadet college program." },
      { q: "Who inspired you to join a cadet college?", a: "I was inspired by [person/event]. [If a family member in the forces: Their dedication and service to the country motivated me.] [If not: Stories of Pakistan's military heroes inspired me.]" },
      { q: "What do you know about Pakistan's armed forces?", a: "Pakistan has three branches: Army (established 1947), Navy, and Air Force. The Pakistan Army is the 6th largest in the world. Our armed forces have defended the country bravely in all conflicts." },
      { q: "Would you like to join the Army, Navy, or Air Force?", a: "I would like to join the [Army/Navy/Air Force] because [reason]. However, I am open to serving in any branch of the armed forces as the ultimate goal is to serve Pakistan." },
      { q: "What is the rank structure in Pakistan Army?", a: "The rank structure from lowest to highest includes: Second Lieutenant, Lieutenant, Captain, Major, Lieutenant Colonel, Colonel, Brigadier, Major General, Lieutenant General, and General." },
      { q: "Name some famous cadet colleges in Pakistan.", a: "Famous cadet colleges include Cadet College Hasanabdal, Cadet College Petaro, Cadet College Kohat, Lawrence College Ghora Gali, and Military College Jhelum." },
      { q: "What extra-curricular activities interest you?", a: "I am interested in debate competitions, sports, scouting, and community service. These activities help develop leadership, communication, and teamwork skills." },
      { q: "How do you plan to balance studies and physical training?", a: "I plan to follow the college schedule diligently, manage my time efficiently, and give my best to both academics and physical training. Proper rest and nutrition will help me maintain this balance." },
      { q: "Do you know the fee structure of this cadet college?", a: "I have discussed the fee structure with my parents. They are fully prepared and supportive of the financial requirements. [Research actual fees before the interview.]" },
      { q: "Can you polish your own shoes and make your bed?", a: "Yes, I already polish my shoes and make my bed every day at home. I believe in self-reliance and taking care of my own belongings." },
      { q: "Are you scared of the dark?", a: "No, I am not scared of the dark. I understand that courage is an important quality for a cadet, and I am ready to face any situation bravely." },
      { q: "Have you ever been punished at school?", a: "I always try to follow rules and behave properly. [If yes, explain honestly what happened and what you learned from it.]" },
      { q: "What leadership experience do you have?", a: "I have served as [class monitor/team captain/prefect] at my school. This experience taught me responsibility, decision-making, and how to lead by example." },
      { q: "Can you handle criticism?", a: "Yes, I view criticism as an opportunity to improve. I listen carefully, evaluate the feedback, and work on becoming better. Constructive criticism helps me grow." },
      { q: "What does patriotism mean to you?", a: "Patriotism means loving my country, working for its betterment, respecting its flag and anthem, following its laws, and being ready to make sacrifices for its defense and prosperity." },
      { q: "If a senior cadet bullies you, what will you do?", a: "I will remain calm and respectful but firm. I would report the matter to the appropriate authority. Bullying is not acceptable, and it is important to address it properly." },
      { q: "How will you adjust to eating mess food?", a: "I am not a picky eater and I understand that mess food is nutritious and designed for active cadets. I will eat whatever is served with gratitude." },
      { q: "Can you iron your own clothes?", a: "Yes, I can iron my clothes. I have learned basic self-care tasks at home to be more self-reliant and independent." },
      { q: "What is your class position?", a: "I consistently rank in the top [X] in my class. I work hard to maintain good academic standing while also participating in other activities." },
      { q: "How do you handle peer pressure?", a: "I stay true to my values and make independent decisions. I choose friends who share positive values and I am not afraid to say no to anything wrong." },
      { q: "What is your understanding of teamwork?", a: "Teamwork means working together towards a common goal, respecting each team member's contribution, supporting each other, and putting the team's success above individual recognition." },
      { q: "Are you ready for early morning physical training?", a: "Yes, I am ready and excited for early morning physical training. I believe physical fitness is crucial for a cadet's life and I already exercise regularly." },
      { q: "What will your first letter home say?", a: "My first letter will tell my parents that I have settled in well, describe my new environment, assure them that I am happy and learning, and thank them for this opportunity." },
      { q: "How many marks did you score in the written test?", a: "I believe I performed well in the written test. I prepared thoroughly and gave my best effort in all sections." },
      { q: "Why should we select you over other candidates?", a: "I am a disciplined, hardworking, and determined student with strong moral values. I have the physical fitness, academic ability, and the right attitude to thrive in a cadet college environment." },
      { q: "What will you do after graduating from this cadet college?", a: "After graduating, I plan to join PMA Kakul to become a commissioned officer in the Pakistan Army/Navy/Air Force and dedicate my life to serving Pakistan." },
      { q: "Do you promise to follow all rules of this institution?", a: "Yes, I promise to follow all rules and regulations of this institution. I believe rules are essential for maintaining order and achieving excellence." },
    ],
  },
  {
    name: "Personality & Character",
    icon: Heart,
    questions: [
      { q: "What is honesty? Why is it important?", a: "Honesty means being truthful in words and actions. It is important because it builds trust, earns respect, and is a fundamental value in Islam. An honest person is respected in society." },
      { q: "What is discipline?", a: "Discipline means following rules, maintaining order, and doing the right thing even when no one is watching. It is essential for success in every field of life, especially in the military." },
      { q: "What is the importance of punctuality?", a: "Punctuality means being on time. It shows respect for others' time, demonstrates reliability, and is a sign of good character. A punctual person is trusted and respected." },
      { q: "What is courage?", a: "Courage means facing fear, danger, or difficulties with bravery and determination. It doesn't mean being fearless, but doing the right thing despite being afraid." },
      { q: "What is leadership?", a: "Leadership is the ability to guide, inspire, and motivate others toward a common goal. A good leader leads by example, listens to others, and takes responsibility." },
      { q: "What is respect?", a: "Respect means treating others with dignity and consideration. It includes respecting elders, peers, and even those younger than us. Respect is earned through good behavior." },
      { q: "What is responsibility?", a: "Responsibility means being accountable for your actions and duties. A responsible person completes tasks on time, admits mistakes, and can be relied upon." },
      { q: "What is teamwork?", a: "Teamwork is working together with others to achieve a common goal. It requires cooperation, communication, respect for each other's ideas, and putting team success above personal glory." },
      { q: "What is integrity?", a: "Integrity means being honest and having strong moral principles. A person with integrity does the right thing even when no one is watching." },
      { q: "What is perseverance?", a: "Perseverance means continuing to try despite difficulties and setbacks. It is the quality of not giving up until you achieve your goal." },
      { q: "How do you react when someone is rude to you?", a: "I remain calm and polite. I try to understand their perspective and respond with kindness. Being rude in return only makes the situation worse." },
      { q: "What would you do if you found a wallet with money?", a: "I would try to find the owner and return the wallet with all the money. If I cannot find the owner, I would hand it over to the authorities. Honesty is very important to me." },
      { q: "If you see a friend cheating in an exam, what would you do?", a: "I would advise my friend privately that cheating is wrong and will harm them in the long run. If they continue, I would not participate and may inform the teacher to help my friend." },
      { q: "What would you do if you made a mistake?", a: "I would honestly admit my mistake, apologize if needed, learn from it, and make sure I don't repeat it. Everyone makes mistakes, but a good person takes responsibility." },
      { q: "How do you handle disagreements with friends?", a: "I listen to their point of view, express my own calmly, and try to find a solution that works for both. I believe in resolving conflicts through communication, not arguments." },
      { q: "What is the importance of hard work?", a: "Hard work is the key to success. Talent alone is not enough without effort. Consistent hard work helps us achieve our goals and earn respect." },
      { q: "What makes a good friend?", a: "A good friend is honest, loyal, supportive, and trustworthy. They stand by you in difficult times and encourage you to be a better person." },
      { q: "What is the difference between a leader and a boss?", a: "A leader inspires and works with the team, leading by example. A boss only gives orders. A leader earns respect, while a boss demands it." },
      { q: "How do you motivate yourself?", a: "I motivate myself by setting goals, remembering my purpose, looking up to role models, and thinking about making my parents and country proud." },
      { q: "What does success mean to you?", a: "Success means achieving your goals through honest hard work while maintaining good character and values. It is not just about money or position, but about making a positive impact." },
      { q: "What is the importance of helping others?", a: "Helping others is a fundamental value in Islam and humanity. It creates a better society, earns Allah's blessings, and gives personal satisfaction." },
      { q: "How do you control your anger?", a: "I practice self-control by taking deep breaths, staying silent for a moment, and thinking before reacting. Prophet Muhammad (PBUH) taught us that the strong person is the one who controls their anger." },
      { q: "What is humility?", a: "Humility means being modest and not arrogant. A humble person acknowledges their strengths without boasting and treats everyone with respect regardless of their status." },
      { q: "What is patience?", a: "Patience (Sabr) means enduring difficulties without complaining and waiting for the right time. It is highly valued in Islam and is essential for success." },
      { q: "How do you deal with criticism?", a: "I listen to criticism with an open mind, evaluate if it is constructive, and use it to improve myself. I don't take it personally but as an opportunity to grow." },
      { q: "What would you do if someone younger needs help?", a: "I would help them without hesitation. Helping younger people is a responsibility, and I would treat them with kindness and patience." },
      { q: "What is the difference between right and wrong?", a: "Right actions align with moral values, Islamic teachings, and laws. Wrong actions harm others, violate rules, and go against moral principles. We should always choose right over wrong." },
      { q: "How do you show gratitude?", a: "I show gratitude by saying Alhamdulillah, thanking people who help me, being content with what I have, and helping others in return." },
      { q: "What is self-discipline?", a: "Self-discipline is controlling your own behavior and actions without external enforcement. It means doing what needs to be done, even when you don't feel like it." },
      { q: "What does sacrifice mean to you?", a: "Sacrifice means giving up something valuable for a greater purpose. Our soldiers sacrifice their comfort and even lives for Pakistan. I am ready to make sacrifices for my country." },
      { q: "How would you help a fellow cadet who is struggling?", a: "I would offer my help with their studies, encourage them, and remind them of their goals. A good cadet supports their peers and no one is left behind." },
      { q: "What does it mean to be a gentleman?", a: "A gentleman is someone who is polite, respectful, honest, well-mannered, and considerate of others. They treat everyone with dignity regardless of their background." },
      { q: "Do you believe in fair play?", a: "Yes, absolutely. Fair play means competing honestly, following rules, respecting opponents, and accepting results gracefully whether you win or lose." },
      { q: "How do you handle success?", a: "I remain humble during success, thank Allah and those who helped me, and use success as motivation to work even harder. I never let success make me arrogant." },
      { q: "What is your definition of a hero?", a: "A hero is someone who puts others before themselves, stands up for what is right, and makes sacrifices for a greater cause. Pakistan's soldiers and our parents are real heroes." },
      { q: "How do you overcome fear?", a: "I face my fears gradually, prepare myself through practice, seek Allah's help through prayer, and remind myself that courage is not the absence of fear but acting despite it." },
      { q: "What is the importance of truth?", a: "Truth is the foundation of trust and good relationships. Islam strongly emphasizes truthfulness. Prophet Muhammad (PBUH) was known as As-Sadiq (The Truthful) even before prophethood." },
      { q: "What makes a person trustworthy?", a: "A trustworthy person keeps promises, maintains confidences, acts honestly, and is consistent in their behavior. Trust is earned through repeated honest actions." },
      { q: "How do you treat people who are different from you?", a: "I treat everyone with respect and kindness regardless of their background, religion, or social status. Islam teaches us that all humans are equal before Allah." },
      { q: "What quality do you admire most in people?", a: "I admire honesty the most because it is the foundation of all other good qualities. An honest person earns trust and respect in every aspect of life." },
      { q: "Do you forgive easily?", a: "Yes, I believe in forgiveness. Holding grudges is harmful. Islam teaches us to forgive others, and forgiving makes us stronger and more peaceful." },
      { q: "What would you do if you disagreed with a senior?", a: "I would express my opinion respectfully and at the appropriate time. I would present my reasoning politely but ultimately respect the senior's decision and follow the chain of command." },
      { q: "What is the value of time?", a: "Time is the most precious resource because once gone, it can never be recovered. Using time wisely through proper planning and avoiding waste is the key to achievement." },
      { q: "How do you stay positive in difficult situations?", a: "I pray to Allah for strength, remember that difficulties are temporary, think of solutions rather than problems, and draw inspiration from people who overcame greater challenges." },
      { q: "What is your greatest fear?", a: "My greatest fear is not living up to my potential and disappointing my parents and country. I overcome this by working hard every day." },
      { q: "Do you think crying shows weakness?", a: "No, crying does not show weakness. It is a natural human emotion. Even Prophet Muhammad (PBUH) cried. What matters is having the strength to face challenges despite emotions." },
      { q: "What is the importance of good manners?", a: "Good manners reflect good upbringing and character. They include saying please and thank you, being polite, respecting others, and behaving properly. Prophet Muhammad (PBUH) had the best manners." },
      { q: "What does freedom mean to you?", a: "Freedom means the ability to make choices while being responsible. It also means Pakistan's independence, which our ancestors sacrificed greatly to achieve." },
      { q: "How would you describe a perfect day?", a: "A perfect day includes waking up for Fajr, exercising, studying well, playing sports, helping someone, spending time with family, and sleeping after Isha prayer feeling accomplished." },
      { q: "What is your philosophy of life?", a: "My philosophy is to work hard, be honest, help others, serve my country, and maintain a strong relationship with Allah. Life is short, and we should make it meaningful." },
    ],
  },
  {
    name: "Current Affairs",
    icon: Newspaper,
    questions: [
      { q: "Who is the current President of Pakistan?", a: "Asif Ali Zardari is the current President of Pakistan. The President is the head of state and is elected by an electoral college." },
      { q: "Who is the current Prime Minister of Pakistan?", a: "Shehbaz Sharif is the current Prime Minister of Pakistan. The Prime Minister is the head of government and leads the federal cabinet." },
      { q: "Who is the current Chief of Army Staff?", a: "General Asim Munir is the current COAS. The COAS is the highest-ranking officer of the Pakistan Army." },
      { q: "Who is the current Chief Justice of Pakistan?", a: "The Chief Justice heads the Supreme Court of Pakistan, which is the highest court in the country. Always check the latest appointment before your interview." },
      { q: "What is the name of the Governor of your province?", a: "You should know the Governor of your own province. The Governor is the representative of the President at the provincial level. Research this before your interview." },
      { q: "What is the name of the Chief Minister of your province?", a: "You should know the Chief Minister of your own province. The CM is the head of the provincial government. Check the latest information before your interview." },
      { q: "What are the current challenges facing Pakistan?", a: "Pakistan faces challenges including economic development, energy crisis, education reform, healthcare improvement, water scarcity, and security issues. However, Pakistan is working to overcome these through various initiatives." },
      { q: "What is inflation?", a: "Inflation is the rise in prices of goods and services over time, which reduces purchasing power. Pakistan, like many countries, faces inflation challenges that affect daily life." },
      { q: "What recent natural disasters have affected Pakistan?", a: "Pakistan has faced floods, earthquakes, and droughts in recent years. The 2022 floods were particularly devastating, affecting millions of people. Climate change has increased these risks." },
      { q: "What is climate change?", a: "Climate change is the long-term change in global weather patterns, mainly caused by human activities like burning fossil fuels. It leads to extreme weather, rising sea levels, and environmental damage." },
      { q: "What is the importance of education in Pakistan?", a: "Education is crucial for Pakistan's development. It reduces poverty, improves healthcare, and creates economic opportunities. Pakistan is working to improve its education system and literacy rate." },
      { q: "What is the literacy rate of Pakistan?", a: "Pakistan's literacy rate is approximately 62-63%. The government is working to improve this through various education programs and initiatives." },
      { q: "What is the significance of Gwadar Port in current affairs?", a: "Gwadar Port is a deep-sea port being developed under CPEC. It will boost trade, create jobs, and position Pakistan as a key player in regional trade routes." },
      { q: "What is Pakistan's relationship with China?", a: "Pakistan and China have a strong friendship often described as 'higher than the Himalayas, deeper than the ocean, sweeter than honey.' CPEC is a major project strengthening this relationship." },
      { q: "What sports achievements has Pakistan had recently?", a: "Pakistan has had achievements in cricket, squash, hockey, and other sports. Pakistani athletes continue to compete at international levels and bring pride to the nation." },
      { q: "What is the role of the Pakistan Army in national defense?", a: "The Pakistan Army defends the country's borders, fights terrorism, assists during natural disasters, and maintains internal security. It is one of the largest and most professional armies in the world." },
      { q: "What is the significance of Pakistan's nuclear capability?", a: "Pakistan's nuclear capability ensures its defense and security. Pakistan became a nuclear power in 1998 and maintains a responsible nuclear program for deterrence." },
      { q: "What are renewable energy sources?", a: "Renewable energy sources include solar, wind, hydroelectric, and geothermal power. Pakistan is investing in these sources to address its energy needs and reduce environmental impact." },
      { q: "What is the role of social media in today's world?", a: "Social media connects people, shares information, and provides a platform for expression. However, it must be used responsibly. Fake news and excessive use are concerns that need to be addressed." },
      { q: "What is artificial intelligence?", a: "Artificial intelligence (AI) is technology that enables machines to think and learn like humans. It is used in many fields including healthcare, education, and defense. Pakistan is also developing AI capabilities." },
      { q: "What recent technological advancements interest you?", a: "I am interested in advancements in space technology, AI, and renewable energy. Pakistan's space program and growing tech industry are exciting developments for our country." },
      { q: "What is Pakistan's role in the United Nations?", a: "Pakistan is an active UN member, contributing to peacekeeping missions worldwide. Pakistani peacekeepers serve in various conflict zones and have earned international recognition." },
      { q: "What is the current state of Pakistan's economy?", a: "Pakistan's economy faces challenges but has strong potential. Agriculture, textiles, IT, and remittances are major contributors. The government is working on economic reforms and development." },
      { q: "What is terrorism and how is Pakistan fighting it?", a: "Terrorism is the use of violence against civilians for political purposes. Pakistan has been fighting terrorism through military operations like Zarb-e-Azb and Radd-ul-Fasaad, sacrificing many soldiers." },
      { q: "What is the importance of planting trees?", a: "Trees provide oxygen, reduce pollution, prevent soil erosion, and combat climate change. Pakistan's Billion Tree Tsunami project aims to increase forest cover across the country." },
      { q: "What is the water crisis in Pakistan?", a: "Pakistan faces water scarcity due to population growth, climate change, and inefficient water management. Building dams and improving water conservation are important solutions." },
      { q: "What is the importance of voting?", a: "Voting is a fundamental democratic right. It allows citizens to choose their representatives and participate in governance. Every citizen should exercise their right to vote responsibly." },
      { q: "What are Pakistan's major exports?", a: "Pakistan's major exports include textiles, rice, leather goods, sports goods, surgical instruments, and IT services. The textile industry is the largest contributor to exports." },
      { q: "What role does the youth play in Pakistan's development?", a: "Pakistan's youth (about 64% of the population) are its greatest asset. They can contribute through education, entrepreneurship, innovation, and active civic participation." },
      { q: "What is the current security situation in Pakistan?", a: "Pakistan has significantly improved its security situation through military operations and counter-terrorism efforts. The armed forces and law enforcement continue to work to maintain peace." },
      { q: "What is the importance of clean drinking water?", a: "Clean drinking water is essential for health. Contaminated water causes diseases. Pakistan needs to invest in clean water infrastructure to ensure safe drinking water for all citizens." },
      { q: "What do you know about space exploration?", a: "Space exploration has led to satellite technology, GPS, and scientific discoveries. Pakistan has its own space program (SUPARCO) and has launched several satellites." },
      { q: "What is SUPARCO?", a: "SUPARCO (Space and Upper Atmosphere Research Commission) is Pakistan's national space agency, established in 1961. It was Asia's first such agency." },
      { q: "What is the importance of the IT sector in Pakistan?", a: "Pakistan's IT sector is growing rapidly, contributing billions in exports. Pakistani freelancers are among the world's top earners. The government is promoting IT education and digital transformation." },
      { q: "What is the 18th Amendment?", a: "The 18th Amendment to Pakistan's constitution, passed in 2010, gave more autonomy to provinces by transferring many subjects from the federal to provincial governments." },
      { q: "What is the significance of the China-Pakistan friendship?", a: "The China-Pakistan friendship is strategic and spans decades. CPEC, military cooperation, and diplomatic support make China one of Pakistan's most important allies." },
      { q: "What is the importance of the media in society?", a: "Media informs the public, holds governments accountable, and provides a platform for discussion. Responsible media is essential for a healthy democracy." },
      { q: "What health challenges does Pakistan face?", a: "Pakistan faces challenges including polio eradication, malnutrition, maternal health, and access to healthcare in rural areas. The government is working on improving healthcare infrastructure." },
      { q: "What is the importance of women's education?", a: "Women's education is crucial for national development. Educated women contribute to the economy, raise healthier families, and participate actively in society. Islam also emphasizes education for all." },
      { q: "What environmental issues does Pakistan face?", a: "Pakistan faces air pollution, deforestation, water contamination, and climate change effects including floods and droughts. Environmental conservation is essential for future generations." },
      { q: "What recent international events have you followed?", a: "I follow international news including [mention recent events]. Staying informed about global events helps me understand Pakistan's position in the world." },
      { q: "What is Pakistan's Vision 2025?", a: "Pakistan Vision 2025 is a development plan aiming to make Pakistan one of the top 25 economies in the world by 2025 through economic growth, human development, and governance reforms." },
      { q: "What is the importance of national unity?", a: "National unity means all Pakistanis working together regardless of ethnicity, language, or sect. Unity is essential for national progress and was emphasized by Quaid-e-Azam." },
      { q: "How can young people contribute to Pakistan's development?", a: "Young people can contribute through education, honest work, community service, innovation, and being responsible citizens. They are the future leaders of Pakistan." },
      { q: "What is the role of Pakistan in regional peace?", a: "Pakistan plays an important role in regional peace through diplomacy, supporting the Afghan peace process, and maintaining deterrence. Pakistan desires peaceful relations with all neighbors." },
      { q: "What is your opinion on corruption?", a: "Corruption is a serious problem that hinders development. It can be reduced through education, strong institutions, accountability, and each individual's commitment to honesty." },
      { q: "What is the Digital Pakistan initiative?", a: "Digital Pakistan is a government initiative to promote digitalization, e-governance, IT infrastructure, and digital skills across the country to modernize Pakistan's economy." },
      { q: "Name a recent achievement of Pakistan that made you proud.", a: "I am proud of Pakistan's achievements in [specific recent achievement - could be sports, technology, military, etc.]. These achievements show the talent and determination of Pakistani people." },
      { q: "What do you think about the importance of sports in Pakistan?", a: "Sports are essential for physical fitness, mental health, national pride, and youth development. Pakistan has produced world-class athletes and needs continued investment in sports infrastructure." },
      { q: "What is your awareness about COVID-19?", a: "COVID-19 was a global pandemic that affected millions worldwide. Pakistan managed it through vaccination drives, smart lockdowns, and the NCOC. It taught us the importance of healthcare preparedness." },
    ],
  },
  {
    name: "Academic",
    icon: Brain,
    questions: [
      { q: "What is your favorite subject?", a: "My favorite subject is [subject] because [reason]. I enjoy learning about it and consistently perform well in it." },
      { q: "Why is Mathematics important?", a: "Mathematics develops logical thinking, problem-solving skills, and analytical abilities. It is used in daily life, science, engineering, and military applications." },
      { q: "What is the Pythagoras theorem?", a: "The Pythagoras theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides (a squared + b squared = c squared)." },
      { q: "What is the formula for area of a circle?", a: "The area of a circle is pi times r squared, where pi is approximately 3.14159 and r is the radius of the circle." },
      { q: "What are the three states of matter?", a: "The three states of matter are solid (fixed shape and volume), liquid (fixed volume, takes shape of container), and gas (no fixed shape or volume)." },
      { q: "What is an atom?", a: "An atom is the smallest unit of matter that retains the properties of an element. It consists of protons and neutrons in the nucleus, with electrons orbiting around it." },
      { q: "What is the difference between speed and velocity?", a: "Speed is the rate of distance covered (scalar quantity). Velocity is speed in a specific direction (vector quantity). Speed has magnitude only; velocity has both magnitude and direction." },
      { q: "What is Newton's First Law of Motion?", a: "Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, unless acted upon by an external force. This is also called the law of inertia." },
      { q: "What is Newton's Second Law of Motion?", a: "Newton's Second Law states that Force equals mass times acceleration (F = ma). The greater the force, the greater the acceleration." },
      { q: "What is Newton's Third Law of Motion?", a: "Newton's Third Law states that for every action, there is an equal and opposite reaction." },
      { q: "What is the difference between a mixture and a compound?", a: "A mixture is a physical combination of substances that retain their properties and can be separated physically. A compound is a chemical combination of elements in fixed proportions that forms a new substance." },
      { q: "What is the importance of English language?", a: "English is an international language used in business, science, technology, and diplomacy. Good English communication skills are essential for success in today's globalized world." },
      { q: "What are the parts of speech in English?", a: "The eight parts of speech are: noun, pronoun, verb, adjective, adverb, preposition, conjunction, and interjection." },
      { q: "What is a noun? Give examples.", a: "A noun is a word that names a person, place, thing, or idea. Examples: student, Pakistan, book, honesty, school, Jinnah." },
      { q: "What is a verb? Give examples.", a: "A verb is a word that shows action or state of being. Examples: run, study, is, write, think, speak." },
      { q: "What is the difference between a simile and a metaphor?", a: "A simile compares two things using 'like' or 'as' (He is brave like a lion). A metaphor directly states one thing is another (He is a lion in battle)." },
      { q: "What is the water formula?", a: "The chemical formula for water is H2O, meaning each water molecule contains two hydrogen atoms and one oxygen atom." },
      { q: "What is the chemical symbol for gold?", a: "The chemical symbol for gold is Au, derived from the Latin word 'aurum.' Gold is a precious metal with atomic number 79." },
      { q: "What is the periodic table?", a: "The periodic table is an organized chart of all known chemical elements, arranged by atomic number. It was developed by Dmitri Mendeleev. There are currently 118 known elements." },
      { q: "Who discovered gravity?", a: "Sir Isaac Newton is credited with discovering the law of universal gravitation in 1687 after observing an apple falling from a tree." },
      { q: "What is percentage? How do you calculate it?", a: "Percentage means 'per hundred.' To calculate: divide the part by the whole, then multiply by 100. For example, 45 out of 90 = (45/90) x 100 = 50%." },
      { q: "What is the HCF and LCM?", a: "HCF (Highest Common Factor) is the largest number that divides two or more numbers exactly. LCM (Least Common Multiple) is the smallest number that is a multiple of two or more numbers." },
      { q: "What is a fraction?", a: "A fraction represents a part of a whole. It has a numerator (top number) and denominator (bottom number). For example, 3/4 means 3 parts out of 4 equal parts." },
      { q: "What are prime numbers?", a: "Prime numbers are numbers greater than 1 that have only two factors: 1 and themselves. Examples: 2, 3, 5, 7, 11, 13, 17, 19, 23." },
      { q: "What is the difference between evaporation and boiling?", a: "Evaporation occurs at any temperature from the surface of a liquid. Boiling occurs at a specific temperature (boiling point) throughout the liquid." },
      { q: "What is the digestive system?", a: "The digestive system breaks down food into nutrients. It includes the mouth, esophagus, stomach, small intestine, large intestine, and accessory organs like the liver and pancreas." },
      { q: "What is the respiratory system?", a: "The respiratory system is responsible for breathing. It includes the nose, trachea, bronchi, and lungs. We breathe in oxygen and breathe out carbon dioxide." },
      { q: "What is the circulatory system?", a: "The circulatory system transports blood throughout the body. It includes the heart, arteries, veins, and capillaries. The heart pumps blood carrying oxygen and nutrients to all body parts." },
      { q: "What is the solar eclipse?", a: "A solar eclipse occurs when the Moon passes between the Sun and Earth, blocking the Sun's light. It can be total, partial, or annular." },
      { q: "What is the lunar eclipse?", a: "A lunar eclipse occurs when the Earth passes between the Sun and Moon, causing Earth's shadow to fall on the Moon." },
      { q: "What is the difference between renewable and non-renewable resources?", a: "Renewable resources can be replenished naturally (solar, wind, water). Non-renewable resources are limited and cannot be replaced once used (coal, oil, natural gas)." },
      { q: "What is the importance of Science?", a: "Science helps us understand the natural world, develop technology, solve problems, and improve our quality of life. It is the basis of modern civilization." },
      { q: "What is geography?", a: "Geography is the study of Earth's landscapes, environments, and the relationships between people and their environments. It includes physical geography and human geography." },
      { q: "What is the difference between weather and climate?", a: "Weather is the day-to-day atmospheric condition of a place (temperature, rain, wind). Climate is the average weather pattern of a place over a long period (30+ years)." },
      { q: "What is erosion?", a: "Erosion is the wearing away of soil and rock by natural forces like water, wind, and ice. It changes the landscape over time and can be accelerated by human activities." },
      { q: "What are the types of rocks?", a: "The three types of rocks are igneous (formed from cooled magma/lava), sedimentary (formed from layers of sediment), and metamorphic (formed from heat and pressure on existing rocks)." },
      { q: "What is the importance of Urdu language?", a: "Urdu is our national language that unites all Pakistanis. It has a rich literary tradition and is important for our cultural identity." },
      { q: "Name some famous Urdu writers.", a: "Famous Urdu writers include Allama Iqbal, Mirza Ghalib, Faiz Ahmed Faiz, Saadat Hasan Manto, Bano Qudsia, and Ashfaq Ahmed." },
      { q: "What is a paragraph?", a: "A paragraph is a group of related sentences about one main idea. It typically has a topic sentence, supporting sentences, and a concluding sentence." },
      { q: "What is an essay?", a: "An essay is a piece of writing that presents the author's argument or point of view on a topic. It has an introduction, body paragraphs, and a conclusion." },
      { q: "What is the importance of computer education?", a: "Computer education is essential in today's digital world. It provides skills needed for most careers, helps in research, communication, and accessing information." },
      { q: "What is the difference between hardware and software?", a: "Hardware refers to the physical parts of a computer (monitor, keyboard, CPU). Software refers to programs and applications that run on the computer (Windows, Word)." },
      { q: "What is the formula for speed?", a: "Speed = Distance divided by Time. If a car travels 100 km in 2 hours, its speed is 100/2 = 50 km/h." },
      { q: "What is the importance of reading?", a: "Reading improves vocabulary, knowledge, imagination, and critical thinking. It is essential for academic success and personal growth. Reading regularly keeps the mind sharp." },
      { q: "What is a map? What are its types?", a: "A map is a representation of the Earth's surface. Types include physical maps (showing terrain), political maps (showing borders), topographic maps, and thematic maps." },
      { q: "What is the equator?", a: "The equator is an imaginary line around the middle of the Earth at 0 degrees latitude. It divides the Earth into the Northern and Southern Hemispheres." },
      { q: "What is longitude and latitude?", a: "Latitude lines run east-west and measure distance north or south of the equator. Longitude lines run north-south and measure distance east or west of the Prime Meridian." },
      { q: "What are vitamins?", a: "Vitamins are essential nutrients that our body needs in small amounts for proper functioning. Types include Vitamin A, B, C, D, E, and K. Each has specific health benefits." },
      { q: "What is the difference between arteries and veins?", a: "Arteries carry oxygenated blood away from the heart (except pulmonary artery). Veins carry deoxygenated blood back to the heart (except pulmonary vein). Arteries have thicker walls." },
      { q: "What is a cell?", a: "A cell is the basic unit of life. All living organisms are made of cells. Cells contain a nucleus, cytoplasm, and cell membrane. Plant cells also have a cell wall and chloroplasts." },
    ],
  },
  {
    name: "Miscellaneous",
    icon: HelpCircle,
    questions: [
      { q: "Tell a joke or something funny.", a: "A polite and appropriate response: 'Why did the student bring a ladder to school? Because they wanted to go to high school!' It's important to keep humor respectful and appropriate." },
      { q: "Sing the national anthem.", a: "Stand at attention and sing with confidence: 'Pak sar zameen shad bad, Kishwar-e-haseen shad bad...' Sing clearly and with respect." },
      { q: "Count from 1 to 20 in English.", a: "One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Eleven, Twelve, Thirteen, Fourteen, Fifteen, Sixteen, Seventeen, Eighteen, Nineteen, Twenty." },
      { q: "What day is today?", a: "[State the current day]. Always be aware of the date, day, and any important events or holidays on that day." },
      { q: "What is the time right now?", a: "[State the approximate time]. Being aware of time shows alertness and awareness of your surroundings." },
      { q: "Can you recite any poem?", a: "I can recite Allama Iqbal's famous poem: 'Sitaron se aage jahan aur bhi hain, Abhi ishq ke imtihan aur bhi hain.' This poem inspires us to aim higher." },
      { q: "Recite any verse from the Quran.", a: "Surah Al-Fatiha: 'Alhamdu lillahi rabbil alamin, Ar-Rahmanir Rahim, Maliki yawmid din...' (All praise is due to Allah, Lord of all worlds, The Most Gracious, The Most Merciful, Master of the Day of Judgment.)" },
      { q: "How many fingers do you have?", a: "I have ten fingers, five on each hand. (Hold up hands and show confidently.)" },
      { q: "What color is your shirt?", a: "[State the color of your shirt/uniform]. Be observant about what you are wearing and your surroundings." },
      { q: "How many windows are in this room?", a: "[Look around and count]. There are [X] windows in this room. Being observant of your surroundings is an important quality." },
      { q: "Name 5 fruits.", a: "Five fruits are: mango (the national fruit of Pakistan), apple, banana, orange, and guava. Fruits are important for a healthy diet." },
      { q: "Name 5 vegetables.", a: "Five vegetables are: potato, tomato, onion, carrot, and spinach. Eating vegetables provides essential vitamins and minerals." },
      { q: "Name 5 animals.", a: "Five animals are: lion (king of the jungle), Markhor (national animal of Pakistan), horse, eagle, and camel." },
      { q: "What is 15 times 15?", a: "15 times 15 equals 225. Quick mental math is a useful skill that shows sharp thinking." },
      { q: "What is the square root of 144?", a: "The square root of 144 is 12, because 12 times 12 equals 144." },
      { q: "Spell the word 'beautiful'.", a: "B-E-A-U-T-I-F-U-L. Beautiful means having qualities of beauty, something pleasing to see or experience." },
      { q: "Spell the word 'necessary'.", a: "N-E-C-E-S-S-A-R-Y. Necessary means required or essential." },
      { q: "What is the opposite of 'brave'?", a: "The opposite of brave is cowardly. A brave person faces danger with courage, while a coward runs away from it." },
      { q: "What is the opposite of 'success'?", a: "The opposite of success is failure. However, failure is not permanent; it is an opportunity to learn and try again." },
      { q: "Make a sentence with the word 'discipline'.", a: "Discipline is the foundation of success in both military and civilian life. Without discipline, even the most talented person cannot achieve their goals." },
      { q: "What is the plural of 'child'?", a: "The plural of child is children. It is an irregular plural form in English." },
      { q: "What is the past tense of 'go'?", a: "The past tense of go is went. It is an irregular verb. Example: I went to school yesterday." },
      { q: "Do you know how to tie a tie?", a: "Yes, I know how to tie a proper knot. [If not: I am learning and can do a basic knot. I am ready to learn the proper way at the cadet college.]" },
      { q: "What would you do on a deserted island?", a: "I would first find fresh water, then build a shelter, look for food, and try to signal for help. Survival skills and staying calm are essential in such situations." },
      { q: "If you could have any superpower, what would it be?", a: "I would choose the power to provide quality education to every child in Pakistan. Education is the most powerful tool for transforming our nation." },
      { q: "What did you eat for breakfast today?", a: "I had [describe breakfast honestly]. A good breakfast gives energy for the day. My mother prepared it for me." },
      { q: "Do you know how to cook?", a: "I know basic cooking like making tea, eggs, and simple meals. I believe everyone should know basic cooking as it is an essential life skill." },
      { q: "What is your telephone number?", a: "Our home phone number is [number] and my father's mobile number is [number]. [Provide only if comfortable and it's an official setting.]" },
      { q: "Draw the Pakistani flag.", a: "[Draw with confidence] The flag has a dark green background with a white vertical stripe on the left side. A white crescent and five-pointed star are on the green portion." },
      { q: "Who is your best friend?", a: "My best friend is [name]. We have been friends for [X] years. They are honest, helpful, and we support each other in studies and activities." },
      { q: "What would you change about the world?", a: "I would work to end poverty and ensure every child has access to quality education. Education is the key to solving most of the world's problems." },
      { q: "Are you nervous right now?", a: "I feel a little excited but I have prepared well for this interview. I am confident in my preparation and ready to answer any questions to the best of my ability." },
      { q: "Can you describe this room?", a: "[Look around and describe honestly]. The room has [describe furniture, walls, windows, and any notable features]. Being observant is an important quality." },
      { q: "What is the name of this cadet college's principal?", a: "[Research this before the interview]. The principal of this cadet college is [Name]. They have been leading this institution with distinction." },
      { q: "Do you have any questions for us?", a: "Yes Sir. I would like to know what activities and opportunities are available for cadets beyond academics, and how the college helps cadets develop into future leaders." },
      { q: "How many months have 28 days?", a: "All 12 months have at least 28 days. However, only February has exactly 28 days (29 in a leap year). This is a tricky question that tests attention to detail." },
      { q: "What comes once in a year, twice in a week, but never in a day?", a: "The letter 'E'. It appears once in 'year', twice in 'week', and does not appear in 'day'." },
      { q: "What is heavier: a kg of iron or a kg of cotton?", a: "Neither is heavier; they both weigh exactly one kilogram. This question tests logical thinking." },
      { q: "If you have 3 apples and take away 2, how many do you have?", a: "You have 2 apples because you took 2 away with you. This is a tricky question that tests careful listening." },
      { q: "Say something about Pakistan.", a: "Pakistan is a beautiful country with diverse geography, from the Arabian Sea to the Karakoram mountains. It was created on 14th August 1947 by Quaid-e-Azam for the Muslims of the subcontinent. Pakistan is rich in culture, history, and has a bright future thanks to its hardworking people." },
      { q: "What will be the first thing you do if selected?", a: "The first thing I will do is thank Allah, then tell my parents the good news, and start preparing myself mentally and physically for the exciting journey ahead." },
      { q: "Any last thing you want to tell us?", a: "Thank you for this opportunity. I am fully committed and prepared for cadet life. If selected, I will work hard to make this institution, my parents, and my country proud. InshaAllah." },
      { q: "What is the meaning of Pakistan?", a: "Pakistan means 'Land of the Pure.' The name was suggested by Choudhry Rahmat Ali in 1933. P-A-K-I-S-T-A-N represents Punjab, Afghania (KPK), Kashmir, Indus-Sindh, and Balochistan." },
      { q: "Can you fold a paper airplane?", a: "Yes, I can fold a paper airplane. [If asked to demonstrate, fold neatly.] It requires precision and attention to detail, qualities important for a cadet." },
      { q: "What would you do if your friend is sick?", a: "I would visit them, offer help, bring their homework from school, and encourage them to rest and see a doctor. Taking care of friends shows compassion and responsibility." },
      { q: "What is the most important invention ever?", a: "I believe the printing press is one of the most important inventions because it made books and knowledge accessible to everyone, transforming education and society." },
      { q: "Why should we not waste water?", a: "Water is essential for life and is a limited resource. Pakistan faces water scarcity, so we must conserve water for future generations. Every drop counts." },
      { q: "What is the importance of trees?", a: "Trees provide oxygen, absorb carbon dioxide, prevent soil erosion, give shade, and support wildlife. Planting trees is a duty for environmental protection." },
      { q: "How would you describe Pakistan to a foreigner?", a: "Pakistan is a land of hospitality, beautiful landscapes, rich history, and warm people. From the beaches of Karachi to the mountains of the north, it offers incredible diversity in geography, food, and culture." },
      { q: "What time did you wake up today?", a: "I woke up at [time] for Fajr prayer. I had a good night's sleep and prepared myself thoroughly for today's interview." },
    ],
  },
];

interface GKQuestion {
  question: string;
  options: string[];
  correct: number;
}

const gkQuizQuestions: GKQuestion[] = [
  { question: "What is the capital of Pakistan?", options: ["Karachi", "Lahore", "Islamabad", "Rawalpindi"], correct: 2 },
  { question: "Which is the largest province of Pakistan by area?", options: ["Punjab", "Sindh", "KPK", "Balochistan"], correct: 3 },
  { question: "When was Pakistan created?", options: ["1945", "1946", "1947", "1948"], correct: 2 },
  { question: "Who is the founder of Pakistan?", options: ["Allama Iqbal", "Liaquat Ali Khan", "Quaid-e-Azam", "Sir Syed Ahmed Khan"], correct: 2 },
  { question: "What is the national language of Pakistan?", options: ["English", "Punjabi", "Urdu", "Sindhi"], correct: 2 },
  { question: "What is the national sport of Pakistan?", options: ["Cricket", "Hockey", "Football", "Squash"], correct: 1 },
  { question: "What is the national flower of Pakistan?", options: ["Rose", "Jasmine", "Sunflower", "Tulip"], correct: 1 },
  { question: "What is the national animal of Pakistan?", options: ["Lion", "Tiger", "Markhor", "Eagle"], correct: 2 },
  { question: "K2 is the _____ highest mountain in the world.", options: ["1st", "2nd", "3rd", "4th"], correct: 1 },
  { question: "How many provinces does Pakistan have?", options: ["3", "4", "5", "6"], correct: 1 },
  { question: "What is the currency of Pakistan?", options: ["Dollar", "Rupee", "Riyal", "Dinar"], correct: 1 },
  { question: "When is Pakistan Day celebrated?", options: ["14 August", "23 March", "25 December", "6 September"], correct: 1 },
  { question: "Which city is known as the 'City of Lights'?", options: ["Lahore", "Islamabad", "Karachi", "Peshawar"], correct: 2 },
  { question: "What is the longest river in Pakistan?", options: ["Jhelum", "Chenab", "Indus", "Ravi"], correct: 2 },
  { question: "When did Pakistan become a nuclear power?", options: ["1996", "1997", "1998", "1999"], correct: 2 },
  { question: "How many pillars of Islam are there?", options: ["3", "4", "5", "6"], correct: 2 },
  { question: "How many Surahs are in the Holy Quran?", options: ["110", "112", "114", "116"], correct: 2 },
  { question: "Who was the first Prime Minister of Pakistan?", options: ["Liaquat Ali Khan", "Iskander Mirza", "Ayub Khan", "Zulfiqar Ali Bhutto"], correct: 0 },
  { question: "Where was the Pakistan Resolution passed?", options: ["Karachi", "Dhaka", "Delhi", "Lahore"], correct: 3 },
  { question: "What is the largest desert in Pakistan?", options: ["Thal", "Cholistan", "Thar", "Kharan"], correct: 2 },
  { question: "Which ocean borders Pakistan?", options: ["Indian Ocean", "Pacific Ocean", "Arabian Sea", "Atlantic Ocean"], correct: 2 },
  { question: "What is Pakistan's national bird?", options: ["Eagle", "Peacock", "Chukar Partridge", "Parrot"], correct: 2 },
  { question: "Who wrote the national anthem of Pakistan?", options: ["Allama Iqbal", "Hafeez Jalandhari", "Faiz Ahmed Faiz", "Ahmed Faraz"], correct: 1 },
  { question: "What is the national tree of Pakistan?", options: ["Neem", "Deodar", "Banyan", "Pine"], correct: 1 },
  { question: "How many colors are in the Pakistani flag?", options: ["2", "3", "4", "5"], correct: 0 },
  { question: "Faisal Mosque is located in which city?", options: ["Karachi", "Lahore", "Islamabad", "Peshawar"], correct: 2 },
  { question: "Minar-e-Pakistan is located in which city?", options: ["Islamabad", "Lahore", "Rawalpindi", "Multan"], correct: 1 },
  { question: "What does CPEC stand for?", options: ["China-Pak Energy Corridor", "China-Pakistan Economic Corridor", "Central Pak Economic Center", "China-Pak Education Council"], correct: 1 },
  { question: "What is the largest lake in Pakistan?", options: ["Saiful Muluk", "Manchar Lake", "Hanna Lake", "Attabad Lake"], correct: 1 },
  { question: "The Karakoram Highway connects Pakistan to which country?", options: ["India", "Afghanistan", "China", "Iran"], correct: 2 },
  { question: "What is the highest pass in Pakistan?", options: ["Khyber Pass", "Bolan Pass", "Khunjerab Pass", "Lowari Pass"], correct: 2 },
  { question: "Who is known as the Poet of the East?", options: ["Ghalib", "Faiz", "Allama Iqbal", "Ahmed Faraz"], correct: 2 },
  { question: "When is Defence Day of Pakistan?", options: ["23 March", "14 August", "6 September", "25 December"], correct: 2 },
  { question: "What is the total number of Nishan-e-Haider recipients?", options: ["8", "9", "10", "11"], correct: 2 },
  { question: "Mohenjo-daro is located in which province?", options: ["Punjab", "Sindh", "KPK", "Balochistan"], correct: 1 },
  { question: "What was the old name of KPK?", options: ["Sarhad", "NWFP", "Frontier", "Gandhara"], correct: 1 },
  { question: "Pakistan Military Academy is located in which city?", options: ["Rawalpindi", "Abbottabad", "Islamabad", "Quetta"], correct: 1 },
  { question: "Which country is to the east of Pakistan?", options: ["China", "Afghanistan", "India", "Iran"], correct: 2 },
  { question: "Quaid-e-Azam's birthday is on which date?", options: ["14 August", "23 March", "25 December", "9 November"], correct: 2 },
  { question: "What is the meaning of the word 'Pakistan'?", options: ["Holy land", "Green land", "Land of the Pure", "Beautiful land"], correct: 2 },
];

interface ConfidenceTip {
  title: string;
  icon: typeof Eye;
  steps: string[];
}

const confidenceTips: ConfidenceTip[] = [
  {
    title: "Posture & Sitting Position",
    icon: Armchair,
    steps: [
      "Stand straight and tall when you enter the room. Do not slouch or lean.",
      "Wait for permission before sitting. Say 'May I sit down, Sir/Ma'am?'",
      "Sit upright with your back against the chair. Keep both feet flat on the floor.",
      "Place your hands on your thighs or on the table edge gently. Do not fidget.",
      "Keep your shoulders relaxed but not drooping. Avoid crossing your arms.",
      "Lean slightly forward when listening to show interest and engagement.",
      "Do not swing your legs or tap your feet during the interview.",
    ],
  },
  {
    title: "Eye Contact",
    icon: Eye,
    steps: [
      "Look at the interviewer's face when they are speaking to you.",
      "Maintain gentle eye contact when answering. Do not stare intensely.",
      "If there are multiple interviewers, look at the one who asked the question, then briefly glance at others.",
      "It is natural to briefly look away while thinking, but return eye contact when speaking.",
      "Avoid looking at the floor, ceiling, or around the room while answering.",
      "Eye contact shows confidence, honesty, and respect.",
      "Practice maintaining eye contact with family members during conversations.",
    ],
  },
  {
    title: "Handshake",
    icon: Hand,
    steps: [
      "Only offer a handshake if the interviewer extends their hand first.",
      "Use a firm but not crushing grip. Avoid a limp handshake.",
      "Shake hands briefly (2-3 seconds) with a slight up-and-down motion.",
      "Make eye contact and smile slightly during the handshake.",
      "Keep your palm dry. If nervous, wipe your hand discreetly before entering.",
      "Use your right hand for the handshake.",
      "A good handshake creates a positive first impression.",
    ],
  },
  {
    title: "Voice & Tone",
    icon: Mic,
    steps: [
      "Speak clearly and at a moderate pace. Do not rush your words.",
      "Keep your voice loud enough to be heard but do not shout.",
      "Use a polite and respectful tone throughout the interview.",
      "Avoid using filler words like 'um', 'uh', 'like', 'you know'.",
      "If you do not understand a question, politely say 'Could you please repeat the question, Sir/Ma'am?'",
      "Take a brief pause before answering to organize your thoughts.",
      "Practice speaking in front of a mirror to improve clarity and confidence.",
      "End your answers clearly. Do not trail off or mumble.",
    ],
  },
  {
    title: "Dressing & Appearance",
    icon: Shirt,
    steps: [
      "Wear clean, ironed, and appropriate formal clothes. A white shirt with dark pants is ideal.",
      "Polish your shoes thoroughly. Clean shoes make a great impression.",
      "Keep your hair neat, clean, and properly combed.",
      "Trim your nails and ensure they are clean.",
      "Do not wear any jewelry, bands, or flashy accessories.",
      "If wearing a tie, make sure it is properly knotted and straight.",
      "Carry a clean handkerchief. Have all required documents in a neat folder.",
      "Take a bath and look fresh on the interview day.",
    ],
  },
  {
    title: "Entering & Leaving the Room",
    icon: Smile,
    steps: [
      "Knock on the door gently (2-3 times) before entering.",
      "Wait for permission to enter. When told, open the door confidently.",
      "Greet with 'Assalamu Alaikum' as you enter. Stand straight.",
      "Walk to the chair calmly. Do not drag your feet.",
      "Wait for the interviewer to ask you to sit before sitting down.",
      "When the interview ends, stand up, say 'Thank you, Sir/Ma'am', and walk out calmly.",
      "Close the door gently behind you. Do not bang it.",
      "Show gratitude and a positive attitude even if you found the interview difficult.",
    ],
  },
];

function CommonQuestionsTab() {
  const [activeCategory, setActiveCategory] = useState<string>(interviewCategories[0].name);
  const totalQuestions = interviewCategories.reduce((sum, cat) => sum + cat.questions.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="secondary" data-testid="badge-total-questions">
          {totalQuestions} Questions with Answers
        </Badge>
        <Badge variant="outline" data-testid="badge-total-categories">
          {interviewCategories.length} Categories
        </Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        {interviewCategories.map((cat) => (
          <Button
            key={cat.name}
            variant={activeCategory === cat.name ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.name)}
            className="toggle-elevate"
            data-testid={`button-category-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <cat.icon className="w-4 h-4 mr-1" />
            {cat.name}
            <Badge variant="secondary" className="ml-1">{cat.questions.length}</Badge>
          </Button>
        ))}
      </div>

      {interviewCategories
        .filter((cat) => cat.name === activeCategory)
        .map((cat) => (
          <Card key={cat.name} className="p-4" data-testid={`card-category-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <cat.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{cat.name}</h3>
              <Badge variant="secondary">{cat.questions.length} Q&A</Badge>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {cat.questions.map((qa, idx) => (
                <AccordionItem key={idx} value={`${cat.name}-${idx}`} data-testid={`accordion-question-${cat.name.replace(/\s+/g, '-').toLowerCase()}-${idx}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-start gap-2 pr-2">
                      <Badge variant="outline" className="shrink-0 mt-0.5">{idx + 1}</Badge>
                      <span className="text-sm font-medium">{qa.q}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-muted/50 rounded-md p-3 ml-8">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Model Answer:</p>
                      <p className="text-sm">{qa.a}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}
    </div>
  );
}

function GKQuizTab() {
  const [quizState, setQuizState] = useState<"idle" | "active" | "finished">("idle");
  const [questions, setQuestions] = useState<GKQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const QUIZ_LENGTH = 20;

  const startQuiz = useCallback(() => {
    const shuffled = [...gkQuizQuestions].sort(() => Math.random() - 0.5).slice(0, QUIZ_LENGTH);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setQuizState("active");
  }, []);

  const handleOptionClick = (optIndex: number) => {
    if (answered) return;
    setSelectedOption(optIndex);
    setAnswered(true);
    if (optIndex === questions[currentIndex].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizState("finished");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  };

  if (quizState === "idle") {
    return (
      <Card className="p-6 text-center" data-testid="card-quiz-start">
        <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">General Knowledge Quiz</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Test your knowledge with {QUIZ_LENGTH} questions about Pakistan, Islam, and general topics.
          Get instant feedback on each answer.
        </p>
        <Button onClick={startQuiz} data-testid="button-start-quiz">Start Quiz</Button>
      </Card>
    );
  }

  if (quizState === "finished") {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "";
    if (percentage >= 90) message = "Outstanding! You are extremely well-prepared!";
    else if (percentage >= 70) message = "Great job! You have strong general knowledge!";
    else if (percentage >= 50) message = "Good effort! Keep studying to improve!";
    else message = "Keep practicing! Read more and try again!";

    return (
      <Card className="p-6 text-center" data-testid="card-quiz-result">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">Quiz Complete!</h3>
        <p className="text-3xl font-bold mb-1" data-testid="text-quiz-score">{score}/{questions.length}</p>
        <p className="text-sm text-muted-foreground mb-1">{percentage}%</p>
        <p className="text-sm font-medium mb-4" data-testid="text-quiz-message">{message}</p>
        <Progress value={percentage} className="mb-4" data-testid="progress-quiz-result" />
        <Button onClick={startQuiz} data-testid="button-restart-quiz">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Quiz
        </Button>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant="secondary" data-testid="badge-quiz-progress">
          Question {currentIndex + 1} of {questions.length}
        </Badge>
        <Badge variant="outline" data-testid="badge-quiz-score">
          Score: {score}/{currentIndex + (answered ? 1 : 0)}
        </Badge>
      </div>
      <Progress value={((currentIndex + 1) / questions.length) * 100} data-testid="progress-quiz" />

      <Card className="p-5" data-testid="card-quiz-question">
        <h3 className="font-semibold mb-4" data-testid="text-quiz-question">{currentQ.question}</h3>
        <div className="space-y-2">
          {currentQ.options.map((opt, idx) => {
            let variant: "outline" | "default" | "destructive" = "outline";
            let extraClass = "hover-elevate";

            if (answered) {
              extraClass = "";
              if (idx === currentQ.correct) {
                variant = "default";
              } else if (idx === selectedOption && idx !== currentQ.correct) {
                variant = "destructive";
              }
            }

            return (
              <Button
                key={idx}
                variant={variant}
                className={`w-full justify-start text-left ${extraClass}`}
                onClick={() => handleOptionClick(idx)}
                disabled={answered && idx !== selectedOption && idx !== currentQ.correct}
                data-testid={`button-option-${idx}`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
                {answered && idx === currentQ.correct && (
                  <CheckCircle2 className="w-4 h-4 ml-auto text-white" />
                )}
                {answered && idx === selectedOption && idx !== currentQ.correct && (
                  <XCircle className="w-4 h-4 ml-auto text-white" />
                )}
              </Button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-4 flex justify-end">
            <Button onClick={nextQuestion} data-testid="button-next-question">
              {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function ConfidenceTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Follow these guidelines to make a strong impression during your interview.
        Confidence and body language are just as important as your answers.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {confidenceTips.map((tip) => (
          <Card key={tip.title} className="p-5 h-full" data-testid={`card-confidence-${tip.title.replace(/\s+/g, '-').toLowerCase()}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{tip.title}</h3>
            </div>
            <ol className="space-y-2">
              {tip.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5">{idx + 1}</Badge>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PortalInterview() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead
        title="Interview Preparation"
        description="Prepare for your cadet college interview with 500+ questions, GK quiz, and confidence guide."
        path="/portal/interview"
      />
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-interview-title">
            Interview Preparation
          </h1>
          <p className="text-muted-foreground mb-6">
            Comprehensive preparation material to ace your cadet college interview.
          </p>

          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="w-full flex" data-testid="tabs-interview">
              <TabsTrigger value="questions" className="flex-1" data-testid="tab-common-questions">
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Common Questions
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex-1" data-testid="tab-gk-quiz">
                <Brain className="w-4 h-4 mr-1.5" />
                GK Quiz
              </TabsTrigger>
              <TabsTrigger value="confidence" className="flex-1" data-testid="tab-confidence">
                <Smile className="w-4 h-4 mr-1.5" />
                Confidence Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              <CommonQuestionsTab />
            </TabsContent>

            <TabsContent value="quiz">
              <GKQuizTab />
            </TabsContent>

            <TabsContent value="confidence">
              <ConfidenceTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
