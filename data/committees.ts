export interface Committee {
    name: string;
    acronym: string;
    slug: string;
    description: string;
    topics: string[];
    color: string;
    draftResolutionUrl: string;
    studentOfficers: {
        name: string;
        role: string;
        email: string;
        image: string;
    }[];
    detailedWriteup?: {
        quote?: string;
        quoteAuthor?: string;
        introduction?: string;
        body?: string[];
        conclusion?: string;
        bibliography?: string[];
        citations?: string[];
    };
}

export const committees: Committee[] = [
    {
        name: 'Special Political & Decolonisation (GA4)',
        acronym: 'GA4',
        slug: 'ga4',
        description: 'Addressing the decolonisation of natural resources and self-determination movements in the post-colonial era.',
        topics: [
            'The Question of Self-Determination Movements in Africa in the Post-Colonial Era in Somaliland',
            'The Role of The United Nations bodies in Facilitating the Decolonisation of Natural Resources in the Horn of Africa'
        ],
        color: 'from-blue-500/20 to-blue-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-ga4',
        studentOfficers: [
            { name: 'Raphael Fohine', role: 'President', email: 'rfohine@gmail.com', image: '/Invite Photos Heads /Raphael1.JPG' },
            { name: 'Kaira Ghosh', role: 'Deputy President', email: 'kaira.ghosh@gmail.com', image: '/Invite Photos Heads /Kaira1.JPG' },
            { name: 'Yug Banerjjee', role: 'Deputy President', email: 'yugzgaming@gmail.com', image: '/Invite Photos Heads /Yug Banerjee.jpg' }
        ],
        detailedWriteup: {
            quote: "He who feeds you, controls you",
            quoteAuthor: "Thomas Sankara, Burkinabé Pan-African Revolutionary",
            introduction: "In 1983, a young African Revolutionist served as the first president of Burkina Faso. A man that stood in front of his people and asked them “What is Imperialism?”. To tell them to look at their plates. The imported grains of rice, corn, and millet. A man that fought for his people, against the chaos, against colonization.",
            body: [
                "Three years into his presidency, Thomas Sankara was assassinated. His question however, did not die with him. Decolonization is never clean nor an easy task. It is not a simple transaction that can be made to suddenly remove all power from imperialism to a country. In SPECPOL, The fourth General Assembly, delegates will work to balance legal, psychological, and economical aspects of the agendas issued to grapple with the unfinished business of decolonization. Decolonization is an act of Justice. It seeks to remedy the historical wrongs that have sent numerous countries in peril.",
                "Our first Agenda, “The Question of Self-Determination Movements in Africa in the Post-Colonial Era in Somaliland”, will focus on Somaliland’s pursuit of self determination, and self recognition. This agenda confronts a tension right in the middle of the United Nations system, as it also determines the right for a “people” to determine their political future. It also targets the right for sovereign states to maintain and preserve the integrity of their territories. For Thirty Five years now, Somaliland has functioned as a democratic, self governing state. Issuing its own currency, organizing political elections, and assuring the safety of its population. However, it has yet to be recognized by the United Nations Member States except that on December 26th of 2025, a decision was made by the State of Israel to formally recognize Somaliland, shattering the long standing diplomatic status in this situation.",
                "Our second Agenda, “The Role of The United Nations in Facilitating the Decolonization of Natural Resources in Africa”, confronts the uneasy truth that when countries were given political independence, it did not include economical deliverance. From 1960 to the late 1970s, the UN passed key resolutions that gave countries the right to control their natural resources. These decisions supported nationalization, challenged unfair colonial agreements, and stated that resources should benefit the country itself. However, the UN has had limited success in turning these ideas into real outcomes. Today, over 80 percent of African countries are to this day commodity dependent, meaning their economies are still structured around the extraction and export of their raw natural resources, the same blueprint that was laid during the colonial times.",
                "Decolonization is seen as an act of raising of flag by a UN committee but this was never and will never be enough. Political Sovereignty without Economical Sovereignty is an argument without weight. Territorial sovereignty without popular Recognition is by other words modern colonialism."
            ],
            conclusion: "“The only thing which we wanted for our country is the right to a worthy life, to dignity without pretence, to independence without restrictions.” — Patrice Lumumba",
            bibliography: [
                "Local Futures. \"He Who Feeds You, Controls You: Thomas Sankara's Legacy and the Battle for Food Sovereignty.\" Local Futures, 11 Aug. 2025, https://www.localfutures.org/he-who-feeds-you-controls-you/",
                "United Nations General Assembly. \"Declaration on the Granting of Independence to Colonial Countries and Peoples.\" OHCHR, Office of the United Nations High Commissioner for Human Rights, https://www.ohchr.org/en/instruments-mechanisms/instruments/declaration-granting-independence-colonial-countries-and-peoples",
                "United Nations General Assembly. \"General Assembly Resolution 1803 (XVII) of 14 December 1962, 'Permanent Sovereignty over Natural Resources'.\" OHCHR, Office of the United Nations High Commissioner for Human Rights, https://www.ohchr.org/en/instruments-mechanisms/instruments/general-assembly-resolution-1803-xvii-14-december-1962-permanent",
                "United Nations Conference on Trade and Development (UNCTAD). \"Economic Development in Africa Report 2022.\" UNCTAD, 2022, unctad.org/edar2022",
                "TheAfricanDream. \"Patrice Lumumba's Last Letter to His Wife: 'The only thing we wanted was the right to a worthy life.'\" TheAfricanDream, 17 Jan. 2021, https://www.theafricandream.net/patrice-lumumba-quotes/"
            ]
        }
    },
    {
        name: 'Security Council',
        acronym: 'SC',
        slug: 'sc',
        description: 'Safeguarding international peace and security amid global crises and humanitarian threats.',
        topics: [
            'Aftereffects of the lasting Impact of Prolonged Warfare in Ukraine on Global Food Security, Energy Stability, and the present and future Credibility of International Security Guarantees',
            'Addressing the humanitarian crisis and threats to international peace and security, resulting from the Yemen conflict through the formation of an independent task force monitored by UN'
        ],
        color: 'from-red-500/20 to-red-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-sc',
        studentOfficers: [
            { name: 'Siddhanth Chawla', role: 'President', email: 'sidchawla20@gmail.com', image: '/Invite Photos Heads /Siddhant1.JPG' },
            { name: 'Aarav Naik', role: 'Deputy President', email: 'lancevance69420@gmail.com', image: '/Invite Photos Heads /Aarav1.JPG' },
            { name: 'Yidam Verma', role: 'Deputy President', email: 'yidamverma00@gmail.com', image: '/Invite Photos Heads /Yidam.jpg' }
        ],
        detailedWriteup: {
            quote: "The United Nations was born from war. Today we must be here for peace.",
            quoteAuthor: "António Guterres",
            introduction: "The United Nations Security Council is the pillar which upholds international peace, equipped with the mandate to take on the threats that traverse borders and endanger the future of humanity. In today’s day and age, where ongoing conflicts which seem to last far longer than they should slowly pick away at our food chains and energy markets while undermining international law, once deemed as unbreakable - the Security Council is one of our last lines of defense.",
            body: [
                "Our first agenda: “Aftereffects of the lasting Impact of Prolonged Warfare in Ukraine on Global Food Security, Energy Stability, and the present and future Credibility of International Security Guarantees”, deals with the continued consequences of the Russia-Ukraine war, a conflict entering its fourth year. Ukraine, once known as the “breadbasket of Europe”, is now in turmoil, and its fields which once fed over 400 million people (UN World Food Programme, 2025), are now nothing but ash. As a result, global wheat exports have significantly fallen, thereby fuelling food insecurity in regions where bread is a staple.",
                "Our second agenda: “Addressing the Humanitarian Crisis and Threats to International Peace and Security Resulting from the Yemen Conflict through the Formation of an Independent Task Force Monitored by the UN”, demands action on a tragedy which has lasted for over a decade now. This conflict has been responsible for 377,00 deaths (Friends Committee on National Legislation, 2023) and 4.5 million Yemeni people (around 14% of the population) displaced from their homes (UNHCR, 2025). The Red Sea crisis which began in late 2023 threatens the 12% of global trade which passes through the Suez Canal.",
                "As the Security Council engages with these issues of conflict head-on, it invites pioneers who are prepared to move beyond mere rhetoric and look at new approaches - negotiate binding task forces, reform international security and do all they can to safeguard a world which needs it more than ever."
            ],
            bibliography: [
                "“UN World Food Programme (WFP).” Wfp.org, 20 Aug. 2025, www.wfp.org/publications/wfp-ukraine-supporting-exports-ukrainian-food-july-2025.",
                "Dumoulin, Marie. “Ukraine, Russia, and the Minsk Agreements: A Post-Mortem.” European Council on Foreign Relations, 19 Feb. 2024, ecfr.eu/article/ukraine-russia-and-the-minsk-agreements-a-post-mortem/.",
                "Carl Waldmeier. “The Saudi-Led War in Yemen: Frequently Asked Questions.” Friends Committee on National Legislation, 2023, www.fcnl.org/issues/middle-east-iran/saudi-led-war-yemen-frequently-asked-questions.",
                "UNHCR. “Yemen Crisis Explained.” Www.unrefugees.org, 27 Mar. 2025, www.unrefugees.org/news/yemen-crisis-explained/.",
                "New Zealand Ministry of Foreign Affairs and Trade. “The Importance of the Suez Canal to Global Trade - 18 April 2021.” New Zealand Ministry of Foreign Affairs and Trade, 18 Apr. 2021, www.mfat.govt.nz/en/trade/mfat-market-reports/the-importance-of-the-suez-canal-to-global-trade-18-april-2021.",
                "“Yemen’s Escalating Hunger Crisis: Nearly Half the Population Struggles to Find Enough Food | the IRC.” Yemen’s Escalating Hunger Crisis: Nearly Half the Population Struggles to Find Enough Food, 2025, www.rescue.org/resource/yemens-escalating-hunger-crisis-nearly-half-population-struggles-find-enough-food."
            ]
        }
    },
    {
        name: 'Economic and Social Council',
        acronym: 'ECOSOC',
        slug: 'ecosoc',
        description: 'Coordinating humanitarian aid and environmental safeguards for global stability.',
        topics: [
            'Emergency Measures to enhance food security and distribution of humanitarian aid in conflict zones across Sudan and South Sudan',
            'Ensuring equitable water sharing of Trans-boundary River Systems of South Asia for upholding Environmental safeguards and issues of Water Security'
        ],
        color: 'from-green-500/20 to-green-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-ecosoc',
        studentOfficers: [
            { name: 'Ayontika Naha', role: 'President', email: 'ayontikan46@gmail.com', image: '/Invite Photos Heads /Ayontika.jpg' },
            { name: 'Nathan George', role: 'Deputy President', email: 'Knathangeorge@gmail.com', image: '/Invite Photos Heads /Nathan1.JPG' },
            { name: 'Anya Narayan', role: 'Deputy President', email: 'reachanyanarayan@gmail.com', image: '/Invite Photos Heads /Aanya1.JPG' }
        ],
        detailedWriteup: {
            quote: "Thousands have lived without love, not one without water.",
            quoteAuthor: "W. H. Auden",
            introduction: "The pursuit of sustainable development is no longer a distant dream in a world where access to food, water, and humanitarian assistance remains challenging. As conflicts intensify, climate pressures mount, and resource scarcity deepens, there is an immediate need for practical, comprehensive, and cooperative solutions to protect vulnerable parts of society and promote long term economic-stability.",
            body: [
                "In ECOSOC, delegates will work on developing resolutions for two pressing challenges that strike the very foundations of sustainable development: the urgency of food security in conflict zones and water security through equitable water sharing of rivers in South Asia.",
                "Our first agenda, \"Emergency Measures to Enhance Food Security and Distribution of Humanitarian Aid in Conflict Zones Across Sudan and South Sudan\" tackles the severe humanitarian crisis unfolding in Sudan and South Sudan. Ongoing violence, mass displacement and the collapse of essential services have pushed millions towards acute food insecurity, with children facing alarming levels of malnutrition and preventable disease.",
                "Our second agenda, “Ensuring equitable water sharing of Trans-boundary River Systems of South Asia for Environmental Protection and Water Security”, sets out to examine political tensions within South Asian countries over freshwater resources. The Indus, the Ganges, and the Brahmaputra are the major river systems that cross borders, flowing through India, Pakistan, and Bangladesh."
            ],
            conclusion: "As the world confronts conflict-driven hunger and intensifying competition over shared water resources, delegates at ECOSOC will be expected to participate in intense discussion, diplomatic cooperation, and meticulous planning throughout the sessions.",
            citations: [
                "https://www.oxfam.org/en/press-releases/escalation-conflict-south-sudan-threatens-push-million-extreme-food-crisis",
                "https://news.un.org/en/story/2026/02/1166931",
                "https://www.foodsecurityportal.org/taxonomy/term/238",
                "https://www.authorea.com/users/846220/articles/1235138-water-security-in-south-asia-transboundary-water-politics-between-india-pakistan-and-bangladesh"
            ]
        }
    },
    {
        name: 'Human Rights Council',
        acronym: 'HRC',
        slug: 'hrc',
        description: 'Promoting and protecting human rights across diverse socio-political landscapes.',
        topics: [
            'The Impact of Socio-Political Instability, Armed Conflict, and Social Conservatism vis-a-vis the Rights of Gender-Divergent in Middle East',
            'Human Rights frameworks and the smooth transition towards a future elected Parliament in the light of Civil Unrest and Democratic Backsliding in Nepal'
        ],
        color: 'from-purple-500/20 to-purple-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-hrc',
        studentOfficers: [
            { name: 'Plaksha Sachanandani', role: 'President', email: 'plaksharajesh@gmail.com', image: '/Invite Photos Heads /Plaksha1.jpg' },
            { name: 'Joshua Jose', role: 'Deputy President', email: 'joshnissan98@gmail.com', image: '/Invite Photos Heads /Joshua1.JPG' },
            { name: 'Diva Meharchandani', role: 'Deputy President', email: 'diva.meharchandani@gmail.com', image: '/Invite Photos Heads /Diva1.JPG' }
        ],
        detailedWriteup: {
            quote: "You must never be fearful about what you are doing when it is right.",
            quoteAuthor: "Rosa Parks",
            introduction: "The Human Rights Council is an important place where countries work together to make things better for people. The Human Rights Council is where countries talk about problems and try to find solutions. As delegates your job is not just to talk, but to listen to others find ground and write plans that can really help people.",
            body: [
                "Our first topic is about people who're different from others in the Middle East. We need to think about how to help them when there is war and instability. These people are at risk of being hurt and treated unfairly. They often cannot get the help they need. When there is a war everything falls apart. There is no law and order and armed groups take over.",
                "The second topic, \"Human Rights Frameworks and the Smooth Transition Towards a Future Elected Parliament in the Light of Civil Unrest and Democratic Backsliding in Nepal\" is about problems that Nepal is facing. Nepal is having a lot of trouble with its government and democracy. It is very important to protect Human Rights like the freedom to say what you think gather with people and join politics.",
                "The two topics are challenging. The Middle East needs help to stop people from being treated because of who they are. Nepal needs help to build its institutions. These two issues are connected by one truth: Human Rights are important everywhere for everyone."
            ],
            citations: [
                "the United Nations",
                "HRC Home | OHCHR",
                "https://commonslibrary.parliament.uk/research-briefings/cbp-9457/",
                "https://www.unicef.org/mena/gender-equality/",
                "https://www.wilsoncenter.org/article/explainer-roots-and-realities-10-conflicts-middle-east",
                "https://www.hrw.org/news/2025/11/19/nepal-unlawful-use-of-force-during-gen-z-protest"
            ]
        }
    },
    {
        name: 'Historical Security Council',
        acronym: 'HSC',
        slug: 'hsc',
        description: 'Re-evaluating historical conflicts that shaped the modern world.',
        topics: [
            'The implications of Cuban Missile Crisis and the Deployment of Strategic Weapons in the Caribbean',
            'Proposed formation of a future independent government with the prevalent Situation in East Pakistan'
        ],
        color: 'from-indigo-500/20 to-indigo-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-hsc',
        studentOfficers: [
            { name: 'Advait Vaishnav', role: 'President', email: 'advaitvaishnav27@gmail.com', image: '/Invite Photos Heads /Advait1.JPG' },
            { name: 'Kavish Goenka', role: 'Deputy President', email: 'kavish.goenka@gmail.com', image: '/Invite Photos Heads /Kavish1.jpg' },
            { name: 'Rithvik Singh', role: 'Deputy President', email: 'rithvik.rahul.singh@gmail.com', image: '/Invite Photos Heads /Rithvik1.JPG' }
        ],
        detailedWriteup: {
            quote: "The farther backward you can look, the farther forward you are likely to see.",
            quoteAuthor: "Winston Churchill",
            introduction: "History is often seen as a closed chapter in our lives, as a sequence of outcomes which we cannot change. In the Historic Security Council (HSC), we aim to reopen that book and rewrite the pages of history. Our aim for this committee is not just to look back at the events of the past, but immerse ourself into crucial moments that have defined the past and continue to influence today’s geopolitical landscape.",
            body: [
                "Our first agenda: “The implications of Cuban Missile Crisis and the Deployment of Strategic Weapons in the Caribbean” deals with the wake of the failed Bay of Pigs invasion (1961) and the persistent threat of Operation Mongoose. Beyond the immediate threat of nuclear annihilation, we must address the violation of the Monroe Doctrine and the failure of traditional diplomacy. Freeze Date: 24th October, 1962.",
                "Our second agenda: “The Proposed Formation of an Independent Government in East Pakistan” explores the Pakistani unification’s breaking point. Following the central government’s perceived negligence during the 1970 Bhola Cyclone and the subsequent refusal to honor the Awami League’s landslide victory, the social contract in the East has vanished. Freeze Date: 3rd December, 1971."
            ],
            bibliography: [
                "General, UN. “United Nations Assistance to East Pakistan Refugees.” United Nations Digital Library System, 13 Feb. 2026.",
                "Hansen, James. “Soviet Deception in the Cuban Missile Crisis Learning from the Past.” Studies in Intelligence, vol. 46, no. 1, 2002.",
                "Office Of The Historian. “The Cuban Missile Crisis, October 1962.” U.S. Department of State."
            ]
        }
    },
    {
        name: 'Disarmament and International Security Committee',
        acronym: 'DISEC',
        slug: 'disec',
        description: 'Regulating emerging military applications and sovereignty questions.',
        topics: [
            'Regulating Lethal Autonomous Weapon Systems (LAWS) and Military Applications of Artificial Intelligence to Maintain International Peace and Security',
            'The question of granting Greenland conditional autonomy from Denmark with regards to use of their own resources and a step towards nationhood'
        ],
        color: 'from-orange-500/20 to-orange-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-disec',
        studentOfficers: [
            { name: 'Satvik Agarwal', role: 'President', email: 'satvikagar2@gmail.com', image: '/Invite Photos Heads /Satvik1.JPG' },
            { name: 'Vivaan Varshney', role: 'Deputy President', email: 'vivaan.varshney23@gmail.com', image: '/Invite Photos Heads /Vivaan Varshney.jpg' },
            { name: 'Medhansh Saha', role: 'Deputy President', email: 'medhanshsaha.10@gmail.com', image: '/Invite Photos Heads /Medhansh1.JPG' }
        ],
        detailedWriteup: {
            quote: "It has become appallingly obvious that our technology has exceeded our humanity.",
            quoteAuthor: "Albert Einstein",
            introduction: "From the ruins of a war that unleashed the most devastating weapons humanity had ever seen, the United Nations was established in 1945. The First Committee of the General Assembly, the Disarmament and International Security Committee, was given a single task: to make sure that the weapons of war would never again surpass the conscience of their operators.",
            body: [
                "Our first agenda item, \"Regulating Lethal Autonomous Weapon Systems (LAWS) and Military Applications of Artificial Intelligence to Maintain International Peace and Security.\" These days, lethal autonomous weapon systems—platforms that can choose and attack targets without significant human involvement—are not just a thing of science fiction.",
                "Our second agenda item, \"The Question of Granting Greenland Conditional Autonomy from Denmark with Regards to Use of Their Own Resources and a Step Towards Nationhood.\" Since 2009, Greenland has been governed under a system of self-government. Facing climate change opening new shipping routes, interest in Arctic resources has intensified."
            ],
            bibliography: [
                "International Committee of the Red Cross. “ICRC Position on Autonomous Weapon Systems.” ICRC, 2022.",
                "United Nations Office for Disarmament Affairs. “Lethal Autonomous Weapon Systems.” UNODA.",
                "Act No. 473 of 12 June 2009. “Act on Greenland Self-Government.”"
            ]
        }
    },
    {
        name: 'International Criminal Court',
        acronym: 'ICC',
        slug: 'icc',
        description: 'Pursuing justice and accountability for crimes against humanity.',
        topics: [
            'The question of the Judicial Rights, privileges and Accountability for the Prisoners of Consciences taken from the Rohingya Population in Myanmar',
            'Setting up Truth and Reconciliation tribunal for Accountability of Crimes Against Humanity During the ongoing and still unfolding Venezuelan Political Crisis'
        ],
        color: 'from-yellow-500/20 to-yellow-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-icc',
        studentOfficers: [
            { name: 'Kiros Kamaal', role: 'President', email: 'kiros.kamaal1@gmail.com', image: '/Invite Photos Heads /Kiros1.jpg' },
            { name: 'Anushka Bahorey', role: 'Deputy President', email: 'anushkabahorey@gmail.com', image: '/Invite Photos Heads /AnushkaBoharey1.jpg' },
            { name: 'Viransh Shetty', role: 'Deputy President', email: 'virshetty2703@gmail.com', image: '/Invite Photos Heads /Viransh Shetty.jpg' }
        ],
        detailedWriteup: {
            quote: "We need the law more than ever. Not the law in abstract terms, not the law as a theory for academicians, lawyers and judges. But we need to see justice in action.",
            quoteAuthor: "Karim A. A. Khan KC, ICC Prosecutor",
            introduction: "The International Criminal Court (ICC) is the organisation that aims to give rise to justice globally, it possesses the ability to prosecute genocide, humanitarian crimes, war crimes and aggression crimes. The ICC supports communities who have been sidelined by the other authorities for too long.",
            body: [
                "Our first agenda: \"The question of the Judicial Rights, Privileges and Accountability for the Prisoners of Conscience taken from the Rohingya Population in Myanmar,\" calls delegates to confront one of the most long lasting crises. The Rohingya, a muslim minority in Myanmar have been discriminated against since the beginning of time.",
                "Our second agenda: “Setting up a Truth and Reconciliation Tribunal for Accountability of Crimes Against Humanity during the ongoing and still unfolding Venezuelan Political Crisis,” puts delegates in the middle of criminal accountability, transitional justice and the use of administrative measures to suppress opposing parties."
            ],
            bibliography: [
                "UNHCR. \"Rohingya Emergency.\" UNHCR, 2025.",
                "Human Rights Watch. \"Myanmar: ICC Prosecutor Requests Arrest Warrant.\" 27 Nov. 2024.",
                "OHCHR. \"Venezuela: Harsh Repression and Crimes Against Humanity Ongoing.\" 17 Mar. 2025."
            ]
        }
    },
    {
        name: 'United Nations Environment Programme',
        acronym: 'UNEP',
        slug: 'unep',
        description: 'Strengthening global protection frameworks for endangered ecosystems. (SIS ONLY)',
        topics: [
            'Addressing the Degradation of Ecosystems and Strengthening Global Protection Frameworks with a focus on development projects in the Bay of Bengal Islands'
        ],
        color: 'from-cyan-500/20 to-cyan-900/20',
        draftResolutionUrl: 'https://docs.google.com/document/d/placeholder-unep',
        studentOfficers: [
            { name: 'Krishiv Agarwal', role: 'President', email: 'krishivagarwal29@gmail.com', image: '/Invite Photos Heads /Krishiv Agarwal.jpg' },
            { name: 'Anushka Iyer', role: 'Deputy President', email: 'nushkaiyer0104@gmail.com', image: '/Invite Photos Heads /AnushaIyer1.JPG' },
            { name: 'Yatharth Bhati', role: 'Deputy President', email: 'yatharthbhatiecole@gmail.com', image: '/Invite Photos Heads /Yatharth Bhati.jpg' }
        ],
        detailedWriteup: {
            quote: "The Earth is what we all have in common.",
            quoteAuthor: "Wendell Berry",
            introduction: "Worldwide ecosystem degradation is no longer merely an environmental concern, and is now an imperative threat to human welfare, climate resilience, and economic prosperity. The Bay of Bengal islands are lush with biodiversity and home to vulnerable coastal communities.",
            body: [
                "The UNEP committee on “Addressing the Degradation of Ecosystems and Strengthening Global Protection Frameworks” spearheads the agenda for this initiative, seeking to establish international partnerships and efforts to protect these ecosystems.",
                "Strengthening global protection regimes is essential for sustainable development in the Bay of Bengal. Existing international programs such as REDD+ and the Paris Agreement provide significant precedent for climate action, but implementation is plagued by enforcement gaps."
            ]
        }
    },
];
