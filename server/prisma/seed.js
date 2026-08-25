const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { calculatePriority } = require('../utils/priority');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data in correct order (respect FK constraints)
  await prisma.solutionVote.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.problemStatusHistory.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ─────────────────────────────────────────────────────────────────

  const hashedAdmin = await bcrypt.hash('Admin@123', 12);
  const hashedUser = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@civicconnect.com', password: hashedAdmin, role: 'ADMIN' },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Arjun Sharma', email: 'arjun@example.com', password: hashedUser, role: 'USER' } }),
    prisma.user.create({ data: { name: 'Priya Kaur', email: 'priya@example.com', password: hashedUser, role: 'USER' } }),
    prisma.user.create({ data: { name: 'Rahul Verma', email: 'rahul@example.com', password: hashedUser, role: 'USER' } }),
    prisma.user.create({ data: { name: 'Simran Singh', email: 'simran@example.com', password: hashedUser, role: 'USER' } }),
    prisma.user.create({ data: { name: 'Mandeep Dhaliwal', email: 'mandeep@example.com', password: hashedUser, role: 'USER' } }),
  ]);

  const orgs = await Promise.all([
    prisma.user.create({ data: { name: 'Punjab Urban Development Authority', email: 'puda@example.com', password: hashedUser, role: 'ORGANIZATION' } }),
    prisma.user.create({ data: { name: 'Clean City Foundation', email: 'cleancity@example.com', password: hashedUser, role: 'ORGANIZATION' } }),
  ]);

  console.log('✅ Users created');

  // ─── Problems ──────────────────────────────────────────────────────────────

  const problemsData = [
    {
      title: 'Massive Pothole on GT Road causing accidents',
      description: 'There is a massive pothole near the main GT Road in Phagwara that has caused multiple accidents in the past month. The road has not been repaired for over 3 months. Two-wheelers are at high risk.',
      category: 'ROADS', location: 'GT Road, Near Bus Stand', city: 'Phagwara',
      severity: 'CRITICAL', status: 'VERIFIED', reportCount: 47, affectedUsers: 500,
      reporterId: users[0].id,
    },
    {
      title: 'Illegal dumping near Residential Colony',
      description: 'Garbage is being illegally dumped near the residential area of Sector 12. Residents are facing health issues due to the smell and mosquitoes breeding in the garbage.',
      category: 'WASTE_MANAGEMENT', location: 'Sector 12, Near Park', city: 'Ludhiana',
      severity: 'HIGH', status: 'IN_PROGRESS', reportCount: 28, affectedUsers: 200,
      reporterId: users[1].id,
    },
    {
      title: 'Water supply contamination in Model Town',
      description: 'The water supplied in Model Town area has a foul smell and appears brownish. Multiple families have complained of stomach issues after consuming tap water. Immediate testing is required.',
      category: 'WATER', location: 'Model Town, Block B', city: 'Jalandhar',
      severity: 'CRITICAL', status: 'VERIFIED', reportCount: 63, affectedUsers: 350,
      reporterId: users[2].id,
    },
    {
      title: 'Street lights not working for 2 months',
      description: 'Over 15 street lights have not been functional in our sector for the past 2 months. This has increased crime incidents and road accidents during night. Senior citizens are particularly at risk.',
      category: 'ELECTRICITY', location: 'Sector 22, Phase 2', city: 'Chandigarh',
      severity: 'HIGH', status: 'VERIFIED', reportCount: 21, affectedUsers: 800,
      reporterId: users[3].id,
    },
    {
      title: 'Government school lacking basic sanitation facilities',
      description: 'The government primary school in our village has only one washroom for 200+ students, and it has been broken for months. Children are forced to use open areas, especially girls who face safety concerns.',
      category: 'EDUCATION', location: 'Village Kartarpur, Ward 5', city: 'Jalandhar',
      severity: 'HIGH', status: 'RESOLVED', reportCount: 15, affectedUsers: 200,
      reporterId: users[4].id,
    },
    {
      title: 'Broken sewage line flooding the main market',
      description: 'The main sewage line near the central market has broken and sewage water is overflowing on the street. Shops are getting affected and there is a risk of disease outbreak.',
      category: 'WATER', location: 'Central Market, Main Bazaar', city: 'Phagwara',
      severity: 'CRITICAL', status: 'IN_PROGRESS', reportCount: 38, affectedUsers: 1000,
      reporterId: users[0].id,
    },
    {
      title: 'Encroachment on public park by local vendors',
      description: 'The community park in our sector has been encroached upon by local vendors who have set up permanent structures. Children and elderly who used the park for recreation can no longer use it.',
      category: 'PUBLIC_SAFETY', location: 'Sector 7 Park', city: 'Ludhiana',
      severity: 'MEDIUM', status: 'PENDING', reportCount: 8, affectedUsers: 300,
      reporterId: users[1].id,
    },
    {
      title: 'Industrial waste being dumped in river',
      description: 'A local factory is reportedly dumping industrial waste directly into the river. The water has turned dark and fish population has depleted. This is an environmental hazard affecting downstream villages.',
      category: 'ENVIRONMENT', location: 'Near Industrial Area Phase 1', city: 'Ludhiana',
      severity: 'CRITICAL', status: 'VERIFIED', reportCount: 74, affectedUsers: 5000,
      reporterId: users[2].id,
    },
    {
      title: 'No traffic signals at dangerous intersection',
      description: 'The intersection at Mall Road and Station Road has no functional traffic signals. At least 3 accidents happen every week here. A child was seriously injured last week due to a collision.',
      category: 'ROADS', location: 'Mall Road - Station Road Crossing', city: 'Chandigarh',
      severity: 'HIGH', status: 'VERIFIED', reportCount: 45, affectedUsers: 2000,
      reporterId: users[3].id,
    },
    {
      title: 'Dog menace in residential area',
      description: 'Stray dogs have become aggressive in our colony and have bitten multiple children. Despite multiple complaints to the municipal corporation, no action has been taken. Parents are scared to send children to school.',
      category: 'PUBLIC_SAFETY', location: 'Green Valley Colony, Phase 3', city: 'Phagwara',
      severity: 'HIGH', status: 'PENDING', reportCount: 22, affectedUsers: 150,
      reporterId: users[4].id,
    },
    {
      title: 'Primary school teachers absent regularly',
      description: 'Teachers at the government primary school are frequently absent, and substitute arrangements are not made. Students sit idle for days. This is affecting the education quality of over 300 children.',
      category: 'EDUCATION', location: 'Village Nakodar, Ward 3', city: 'Jalandhar',
      severity: 'MEDIUM', status: 'REJECTED', reportCount: 5, affectedUsers: 300,
      reporterId: users[0].id,
    },
    {
      title: 'Overgrown trees blocking road visibility',
      description: 'Overgrown trees on the main highway have severely reduced road visibility at several turns. Multiple near-miss accidents have been reported. The trees need urgent pruning before the monsoon season.',
      category: 'ENVIRONMENT', location: 'NH-44, Near Toll Plaza', city: 'Ludhiana',
      severity: 'MEDIUM', status: 'VERIFIED', reportCount: 11, affectedUsers: 400,
      reporterId: users[1].id,
    },
    {
      title: 'Power cuts lasting 12+ hours daily',
      description: 'Our area is experiencing power cuts of 12 to 14 hours every day for the past 3 weeks during summer. This is causing serious issues for small businesses, patients on medical equipment, and students.',
      category: 'ELECTRICITY', location: 'Urban Estate, Phase 1', city: 'Phagwara',
      severity: 'HIGH', status: 'IN_PROGRESS', reportCount: 89, affectedUsers: 1200,
      reporterId: users[2].id,
    },
    {
      title: 'Missing manhole covers causing accidents',
      description: 'Several manhole covers are missing on the main road of our ward. Two accidents have already happened at night. The municipality needs to replace them urgently before the rains make them even more dangerous.',
      category: 'ROADS', location: 'Ward No. 12, Near Bus Terminal', city: 'Chandigarh',
      severity: 'HIGH', status: 'VERIFIED', reportCount: 19, affectedUsers: 600,
      reporterId: users[3].id,
    },
    {
      title: 'Open drainage causing mosquito breeding',
      description: 'The open drainage channel behind our colony has not been cleaned in months. Stagnant water is causing massive mosquito breeding. Multiple children have been diagnosed with dengue fever this week.',
      category: 'WASTE_MANAGEMENT', location: 'Behind Model Town, Sector 4', city: 'Jalandhar',
      severity: 'CRITICAL', status: 'VERIFIED', reportCount: 32, affectedUsers: 250,
      reporterId: users[4].id,
    },
  ];

  const createdProblems = [];
  for (const p of problemsData) {
    const proposalCount = 0;
    const { score, level } = calculatePriority({
      severity: p.severity, reportCount: p.reportCount,
      proposalCount, affectedUsers: p.affectedUsers,
    });

    const problem = await prisma.problem.create({
      data: {
        title: p.title, description: p.description, category: p.category,
        location: p.location, city: p.city, severity: p.severity,
        status: p.status, reportCount: p.reportCount, affectedUsers: p.affectedUsers,
        priorityScore: score, priorityLevel: level, reporterId: p.reporterId,
      },
    });

    // Add initial status history
    await prisma.problemStatusHistory.create({
      data: { problemId: problem.id, status: 'PENDING', changedById: p.reporterId, note: 'Problem reported' },
    });

    if (p.status !== 'PENDING') {
      await prisma.problemStatusHistory.create({
        data: { problemId: problem.id, status: p.status === 'REJECTED' ? 'REJECTED' : 'VERIFIED', changedById: admin.id, note: 'Reviewed by admin' },
      });
    }

    if (p.status === 'IN_PROGRESS' || p.status === 'RESOLVED') {
      await prisma.problemStatusHistory.create({
        data: { problemId: problem.id, status: p.status, changedById: admin.id, note: 'Status updated' },
      });
    }

    createdProblems.push(problem);
  }

  console.log(`✅ ${createdProblems.length} problems created`);

  // ─── Solutions ─────────────────────────────────────────────────────────────

  const solutionsData = [
    // GT Road pothole (index 0)
    {
      title: 'Emergency patching with hot mix asphalt',
      description: 'Immediately deploy a road repair team with hot mix asphalt to fill the pothole. Set up proper signage and barriers during repair. Follow up with full resurfacing within 30 days.',
      estimatedCost: '₹50,000 - ₹75,000',
      expectedImpact: 'Eliminates immediate accident risk within 48 hours. Prevents further damage to vehicle suspensions.',
      problemIdx: 0, contributorId: orgs[0].id, status: 'APPROVED',
    },
    {
      title: 'Install road safety barriers temporarily',
      description: 'Install water-filled barriers and warning cones around the pothole to protect road users while awaiting permanent repairs. Coordinate with traffic police for re-routing.',
      estimatedCost: '₹15,000',
      expectedImpact: 'Immediate safety improvement. Reduces accident risk by 80% while permanent solution is prepared.',
      problemIdx: 0, contributorId: users[1].id, status: 'PENDING',
    },
    // Garbage dumping (index 1)
    {
      title: 'Deploy waste segregation bins and CCTV',
      description: 'Install separate bins for biodegradable and non-biodegradable waste. Set up CCTV cameras to catch illegal dumpers. Impose heavy fines with zero tolerance policy.',
      estimatedCost: '₹2,00,000',
      expectedImpact: 'Reduces illegal dumping by 90%. Creates a sustainable waste management system.',
      problemIdx: 1, contributorId: orgs[1].id, status: 'APPROVED',
    },
    {
      title: 'Community Awareness Campaign',
      description: 'Organize ward-level awareness programs about proper waste disposal. Engage NGOs and schools. Create a WhatsApp group for residents to report dumping incidents.',
      estimatedCost: '₹25,000',
      expectedImpact: 'Long-term behavioral change. Reduces dumping incidents by 60% within 3 months.',
      problemIdx: 1, contributorId: users[2].id, status: 'PENDING',
    },
    // Water contamination (index 2)
    {
      title: 'Immediate water testing and alternate supply',
      description: 'Dispatch water testing team within 24 hours. If contamination confirmed, arrange tanker water supply immediately. Identify and fix the contamination source (likely pipe leakage near sewage).',
      estimatedCost: '₹1,50,000',
      expectedImpact: 'Prevents disease outbreak. Provides clean water within 48 hours.',
      problemIdx: 2, contributorId: orgs[0].id, status: 'PENDING',
    },
    // Street lights (index 3)
    {
      title: 'Replace with solar-powered LED street lights',
      description: 'Replace the broken conventional street lights with solar-powered LED lights. These require no electricity grid connection and have lower maintenance costs. Install along the entire sector.',
      estimatedCost: '₹8,00,000',
      expectedImpact: 'Permanent lighting solution. Reduces electricity bills by 100%. 20-year lifespan.',
      problemIdx: 3, contributorId: orgs[0].id, status: 'APPROVED',
    },
    {
      title: 'Emergency repair of existing streetlights',
      description: 'Conduct immediate inspection of all 15 non-functional lights. Replace faulty bulbs, ballasts, and wiring. Complete repair within 1 week.',
      estimatedCost: '₹45,000',
      expectedImpact: 'Restores lighting within 7 days. Immediate safety improvement for night-time movement.',
      problemIdx: 3, contributorId: users[3].id, status: 'PENDING',
    },
    // Sewage line (index 5)
    {
      title: 'Emergency excavation and pipe replacement',
      description: 'Immediately cordon off the affected area. Excavate the broken section and replace with PVC sewage pipes. Repair to be completed within 72 hours on emergency basis.',
      estimatedCost: '₹3,50,000',
      expectedImpact: 'Stops sewage overflow within 3 days. Prevents disease outbreak. Restores market operations.',
      problemIdx: 5, contributorId: orgs[0].id, status: 'APPROVED',
    },
    // Industrial waste (index 7)
    {
      title: 'Legal notice and factory inspection',
      description: 'File an FIR against the factory. PPCB should conduct emergency inspection. Seal the factory until proper waste treatment plant is installed. Fine of ₹50 lakh as per environmental laws.',
      estimatedCost: 'Regulatory action',
      expectedImpact: 'Stops dumping immediately through legal enforcement. Sets precedent for other factories.',
      problemIdx: 7, contributorId: users[0].id, status: 'PENDING',
    },
    {
      title: 'Install community water treatment plant',
      description: 'Install a downstream water treatment facility funded by the polluting industry under polluter pays principle. Restore river ecosystem with periodic monitoring.',
      estimatedCost: '₹50,00,000',
      expectedImpact: 'Long-term river restoration. Clean water for downstream villages within 6 months.',
      problemIdx: 7, contributorId: orgs[1].id, status: 'PENDING',
    },
    // Traffic signals (index 8)
    {
      title: 'Install smart adaptive traffic signals',
      description: 'Install modern adaptive traffic signal system with pedestrian crossing signals, countdown timers, and emergency vehicle detection. Also add reflective road markings and a speed bump approaching the intersection.',
      estimatedCost: '₹12,00,000',
      expectedImpact: 'Reduces accidents at intersection by 85%. Improves traffic flow. Better pedestrian safety.',
      problemIdx: 8, contributorId: orgs[0].id, status: 'APPROVED',
    },
    // Power cuts (index 12)
    {
      title: 'Upgrade transformer and feeder lines',
      description: 'The current transformer is overloaded. Replace with higher capacity transformer. Upgrade the feeder lines to handle peak summer load. Install load balancing switches.',
      estimatedCost: '₹25,00,000',
      expectedImpact: 'Eliminates load shedding in the area. Stable power supply for 5000+ consumers.',
      problemIdx: 12, contributorId: orgs[0].id, status: 'APPROVED',
    },
    {
      title: 'Community solar microgrid project',
      description: 'Establish a community solar microgrid with battery backup for critical facilities like hospitals, schools, and street lights. Partner with MNRE for subsidies.',
      estimatedCost: '₹1,50,00,000',
      expectedImpact: 'Long-term energy independence. Powers critical facilities during outages.',
      problemIdx: 12, contributorId: orgs[1].id, status: 'PENDING',
    },
    // Drainage (index 14)
    {
      title: 'Cover and desilting of open drainage channels',
      description: 'Desilt and clean the drainage channel immediately. Cover the open drains with concrete slabs to prevent mosquito breeding. Establish monthly maintenance schedule.',
      estimatedCost: '₹4,50,000',
      expectedImpact: 'Eliminates mosquito breeding sites. Reduces dengue risk by 95%. Cleaner environment.',
      problemIdx: 14, contributorId: orgs[0].id, status: 'APPROVED',
    },
    {
      title: 'Fogging and larvicide treatment',
      description: 'Immediate fogging of the area to control adult mosquito population. Apply larvicide to the drainage water. Set up health camps for dengue testing.',
      estimatedCost: '₹35,000',
      expectedImpact: 'Immediate reduction in mosquito population within 48 hours. Health camps for 250 residents.',
      problemIdx: 14, contributorId: users[4].id, status: 'PENDING',
    },
    // Missing manholes (index 13)
    {
      title: 'Replace with tamper-proof CI manhole covers',
      description: 'Replace all missing manhole covers with cast iron tamper-proof covers with anti-theft locking mechanism. Install warning signs at each location until replaced.',
      estimatedCost: '₹90,000',
      expectedImpact: 'Eliminates accident risk. Tamper-proof design prevents future theft.',
      problemIdx: 13, contributorId: orgs[0].id, status: 'PENDING',
    },
    // School sanitation (index 4) - this was resolved
    {
      title: 'Build new block of 4 washrooms',
      description: 'Construct a new washroom block with separate facilities for boys and girls. Include hand-washing stations. Use Swachh Bharat Mission funds for construction.',
      estimatedCost: '₹3,00,000',
      expectedImpact: 'Proper sanitation for 200+ students. Improves school attendance especially for girls.',
      problemIdx: 4, contributorId: orgs[1].id, status: 'APPROVED',
    },
    {
      title: 'Portable toilet cabins as temporary solution',
      description: 'Install portable hygienic toilet cabins with regular servicing while permanent washrooms are constructed under Swachh Bharat Mission.',
      estimatedCost: '₹60,000 per year',
      expectedImpact: 'Immediate sanitation solution within 1 week. Students need not go to open areas.',
      problemIdx: 4, contributorId: users[2].id, status: 'APPROVED',
    },
    // Trees blocking road (index 11)
    {
      title: 'Emergency tree pruning by horticulture department',
      description: 'Deploy the horticulture department team for emergency pruning of overgrown branches. Set up a quarterly pruning schedule for all trees along highways.',
      estimatedCost: '₹80,000',
      expectedImpact: 'Improves road visibility within 5 days. Prevents accidents at blind turns.',
      problemIdx: 11, contributorId: orgs[1].id, status: 'PENDING',
    },
    {
      title: 'Install road signs and reflectors at blind spots',
      description: 'While trees are being pruned, install curve warning signs, reflective road markings, and delineators at the most dangerous turns. These provide immediate safety improvement.',
      estimatedCost: '₹25,000',
      expectedImpact: 'Immediate improvement in driver visibility. Reduces risk of head-on collisions.',
      problemIdx: 11, contributorId: users[0].id, status: 'PENDING',
    },
  ];

  for (const s of solutionsData) {
    const problem = createdProblems[s.problemIdx];
    await prisma.solution.create({
      data: {
        title: s.title, description: s.description,
        estimatedCost: s.estimatedCost, expectedImpact: s.expectedImpact,
        problemId: problem.id, contributorId: s.contributorId, status: s.status,
      },
    });
  }

  console.log(`✅ ${solutionsData.length} solutions created`);

  // ─── Add some votes ────────────────────────────────────────────────────────

  const allSolutions = await prisma.solution.findMany({ take: 10 });
  const allUsers = [admin, ...users, ...orgs];

  for (const solution of allSolutions) {
    const votersCount = Math.floor(Math.random() * 5) + 1;
    const shuffled = allUsers.sort(() => 0.5 - Math.random()).slice(0, votersCount);
    for (const voter of shuffled) {
      if (voter.id !== solution.contributorId) {
        await prisma.solutionVote.upsert({
          where: { solutionId_userId: { solutionId: solution.id, userId: voter.id } },
          update: {},
          create: { solutionId: solution.id, userId: voter.id },
        });
      }
    }
  }

  console.log('✅ Votes added');
  console.log('\n🎉 Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo credentials:');
  console.log('  Admin:        admin@civicconnect.com  /  Admin@123');
  console.log('  User:         arjun@example.com       /  User@123');
  console.log('  Organization: puda@example.com        /  User@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
