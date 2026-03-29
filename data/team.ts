export interface TeamMember {
    name: string;
    role: string;
    email?: string;
    image: string;
    category: 'Secretariat' | 'Department Heads' | 'Presidents' | 'Deputy Presidents';
}

export const teamMembers: TeamMember[] = [
    // Secretariat
    { name: 'Zorawar Bhinder', role: 'Secretary General', email: 'zorawarbhinder7@gmail.com', image: '/team-photos/Zorawar.jpg', category: 'Secretariat' },
    { name: 'Ritvayg Bindal', role: 'Deputy Secretary General', email: 'ritvayg@gmail.com', image: '/team-photos/Ritvayg.jpg', category: 'Secretariat' },
    { name: 'Chahel Dharod', role: 'Deputy Secretary General', email: 'chaheldharod@gmail.com', image: '/team-photos/Chahel.jpg', category: 'Secretariat' },

    // Department Heads
    { name: 'Aryan Jindal', role: 'Tech Head', image: '/team-photos/Aryan.jpg', category: 'Department Heads' },
    { name: 'Sarthak Devrani', role: 'Joint Tech Head', image: '/team-photos/Sarthak.jpg', category: 'Department Heads' },
    { name: 'Ahana Patil', role: 'Design & Media Head', image: '/team-photos/Ahana.jpg', category: 'Department Heads' },
    { name: 'Angad Sawant', role: 'Joint Design & Media Head', image: '/team-photos/Angad.jpg', category: 'Department Heads' },
    { name: 'Tchia Pathare', role: 'Press Head', image: '/team-photos/Tchia.jpg', category: 'Department Heads' },
    { name: 'Saisha Swamy', role: 'Joint Press Head', image: '/team-photos/Saisha.jpg', category: 'Department Heads' },
    { name: 'Parth Toprani', role: 'Logistics & Hospitality Head', image: '/team-photos/Parth.jpg', category: 'Department Heads' },
    { name: 'Mahi Kasat', role: 'Joint Logistics & Hospitality Head', image: '/team-photos/Mahi.jpg', category: 'Department Heads' },

    // Presidents
    { name: 'Raphael Fohine', role: 'President (GA4)', image: '/team-photos/Raphael.jpg', category: 'Presidents' },
    { name: 'Siddhanth Chawla', role: 'President (SC)', image: '/team-photos/Siddhanth.jpg', category: 'Presidents' },
    { name: 'Ayontika Naha', role: 'President (ECOSOC)', image: '/team-photos/Ayontika.jpg', category: 'Presidents' },
    { name: 'Plaksha Sachanandani', role: 'President (HRC)', image: '/team-photos/Plaksha.jpg', category: 'Presidents' },
    { name: 'Advait Vaishnav', role: 'President (HSC)', image: '/team-photos/Advait.jpg', category: 'Presidents' },
    { name: 'Satvik Agarwal', role: 'President (DISEC)', image: '/team-photos/Satvik.jpg', category: 'Presidents' },
    { name: 'Kiros Kamaal', role: 'President (ICC)', image: '/team-photos/Kiros.jpg', category: 'Presidents' },
    { name: 'Krishiv Agarwal', role: 'President (UNEP)', image: '/team-photos/Krishiv.jpg', category: 'Presidents' },

    // Deputy Presidents
    { name: 'Kaira Ghosh', role: 'Deputy President (GA4)', image: '/team-photos/Kaira.jpg', category: 'Deputy Presidents' },
    { name: 'Yug Banerjjee', role: 'Deputy President (GA4)', image: '/team-photos/Yug.jpg', category: 'Deputy Presidents' },
    { name: 'Aarav Naik', role: 'Deputy President (SC)', image: '/team-photos/Aarav.jpg', category: 'Deputy Presidents' },
    { name: 'Yidam Verma', role: 'Deputy President (SC)', image: '/team-photos/Yidam.jpg', category: 'Deputy Presidents' },
    { name: 'Nathan George', role: 'Deputy President (ECOSOC)', image: '/team-photos/Nathan.jpg', category: 'Deputy Presidents' },
    { name: 'Aanya Narayan', role: 'Deputy President (ECOSOC)', image: '/team-photos/Aanya.jpg', category: 'Deputy Presidents' },
    { name: 'Joshua Jose', role: 'Deputy President (HRC)', image: '/team-photos/Joshua.jpg', category: 'Deputy Presidents' },
    { name: 'Diva Meharchandani', role: 'Deputy President (HRC)', image: '/team-photos/Diva.jpg', category: 'Deputy Presidents' },
    { name: 'Kavish Goenka', role: 'Deputy President (HSC)', image: '/team-photos/Kavish.jpg', category: 'Deputy Presidents' },
    { name: 'Rithvik Singh', role: 'Deputy President (HSC)', image: '/team-photos/Rithvik.jpg', category: 'Deputy Presidents' },
    { name: 'Vivaan Varshney', role: 'Deputy President (DISEC)', image: '/team-photos/Vivaan.jpg', category: 'Deputy Presidents' },
    { name: 'Medhansh Saha', role: 'Deputy President (DISEC)', image: '/team-photos/Medhansh.jpg', category: 'Deputy Presidents' },
    { name: 'Viransh Shetty', role: 'Deputy President (ICC)', image: '/team-photos/Viransh.jpg', category: 'Deputy Presidents' },
    { name: 'Anushka Iyer', role: 'Deputy President (UNEP)', image: '/team-photos/Anushka.jpg', category: 'Deputy Presidents' },
    { name: 'Yatharth Bhati', role: 'Deputy President (UNEP)', image: '/team-photos/Yatharth.jpg', category: 'Deputy Presidents' },
];
