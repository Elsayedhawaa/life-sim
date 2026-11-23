/* Stories about the life being played, not a fixed real person's biography.
   No automatic job, cash reward or cure: choices change skills, relationships
   and the journal. All technology stories have era gates. */
import { clamp } from '../core/rng.js';
import { recordJournal } from '../core/schema.js';
import { rememberDeed } from '../systems/soulEngine.js';

function change(st, field, amount) {
  const [group, key] = field.split('.');
  const target = group === 'vitals' ? st.player.vitals : st[group];
  if (target) target[key] = clamp((Number(target[key]) || 0) + amount);
}
function story(id, title, gates, text, options, extra = {}) {
  return {
    id, category: extra.category || 'life', gates, ...extra,
    build(S, ctx) {
      const person = extra.person ? ctx[extra.person] : null;
      if (extra.person && !person?.alive) return null;
      const name = person?.firstName || '';
      return {
        key: id, category: extra.category || 'life', title,
        speakerId: person?.id,
        text: typeof text === 'function' ? text(S, name) : text,
        choices: options.map(([label, outcome, deltas = {}, bond = null]) => ({
          label,
          effect(st) {
            for (const [field, amount] of Object.entries(deltas)) change(st, field, amount);
            if (bond && person && st.people[person.id]?.alive) {
              rememberDeed(st, st.people[person.id], 'visited', outcome, bond);
            }
            recordJournal(st, outcome, extra.category || 'life');
          },
        })),
      };
    },
  };
}
const adult = { minAge: 18 };
const jobHunt = { minAge: 20, hasJob: false, education: 'graduated' };
const techHunt = { ...jobHunt, minYear: 2008 };
const friend = { minAge: 18, requiredPeople: ['friend'] };
const localPlace = S => ({
  egy: 'a small tea shop', sau: 'a neighbourhood coffee shop', uae: 'a cafe near the bus stop',
  jpn: 'a quiet neighbourhood cafe', ind: 'a tea stall', gbr: 'a local cafe',
  usa: 'a neighbourhood diner', bra: 'a corner bakery', ita: 'a neighbourhood coffee bar',
}[S.country] || 'a small neighbourhood cafe');

export const EVENTS_LIVED_LIFE = [
  story('ev_deu_stairwell', 'The Note in the Stairwell', {minAge:18,countries:['deu'],housingModes:['rent']},
    S => `A handwritten notice in your building in ${S.city} asks residents to keep the shared stairwell clear. You had left a box there while sorting your home.`, [
      ['Bring the box inside and make room for it properly', 'You brought your box inside so the shared route stayed clear. A small household task was finally finished.', {'vitals.stress':-2}],
      ['Ask the building contact where bulky items can go', 'You asked where bulky items could be stored instead of assuming the stairwell was available. You moved your box out of the way.', {'skills.charisma':2}],
    ], {category:'home'}),
  story('ev_deu_first_meeting', 'Before the First Meeting', {minAge:18,countries:['deu'],hasJob:true},
    S => `Before a meeting at work in ${S.city}, a colleague sends a short agenda. One item is unfamiliar, but there is enough time to ask about it before everyone sits down.`, [
      ['Ask the colleague what needs deciding', 'You asked what decision the unfamiliar item needed and arrived better prepared, without pretending expertise you did not have.', {'skills.charisma':2,'vitals.smarts':1}],
      ['Write down a clear question to raise in the meeting', 'You prepared a clear question instead of silently guessing what the agenda meant.', {'vitals.smarts':2}],
    ], {category:'career'}),

  story('ev_usa_offer_commute', 'An Offer and a Journey', {minAge:18,countries:['usa'],hasJob:false},
    S => `A possible job in ${S.city} sounds appealing until you map the journey. The pay is only one part of the choice; the time getting there would become part of every workday.`, [
      ['Ask about the actual schedule before deciding', 'You asked for the schedule and work location in writing. You had not accepted the offer or received any pay.', {'skills.charisma':2}],
      ['Compare travel time with the hours you want at home', 'You compared the commute with your own priorities instead of assuming the highest headline pay was always best. The job remained only a possibility.', {'vitals.smarts':2,'vitals.stress':-1}],
    ], {category:'career'}),
  story('ev_usa_shared_laundry', 'The Last Load', {minAge:18,countries:['usa'],housingModes:['rent']},
    S => `You reach the shared laundry in your rented building in ${S.city} and find the machine still full. You have enough time for one load before bed, if the other resident comes back soon.`, [
      ['Wait a little and leave a polite note', 'You waited briefly and left a polite note without moving another resident’s clothes. The laundry could wait until tomorrow if needed.', {'vitals.stress':-1}],
      ['Choose tomorrow and use the evening for something else', 'You moved laundry to tomorrow rather than turning a small delay into the whole evening.', {'vitals.stress':-2}],
    ], {category:'home'}),

  story('ev_gbr_damp_report', 'The Patch by the Window', {minAge:18,countries:['gbr'],housingModes:['rent']},
    S => `After a wet week in ${S.city}, you notice a damp patch beside the window in your rented home. Wiping it away does not tell you why it keeps returning.`, [
      ['Photograph it and ask the landlord for an inspection', 'You recorded the damp patch and asked for its cause to be checked. You kept the report instead of assuming a repair had happened.', {'vitals.smarts':2,'vitals.stress':-1}],
      ['Record when it appears and keep the room aired', 'You noted when the patch appeared, aired the room where practical and kept the issue on your repair list. It was not magically fixed.', {'vitals.smarts':1}],
    ], {category:'home'}),
  story('ev_gbr_commute_options', 'The Earlier Train', {minAge:18,countries:['gbr'],hasJob:true},
    S => `Checking tomorrow's journey to work in ${S.city}, you notice that the route you usually take leaves little room for delays. There is an earlier option, but it would cost you sleep.`, [
      ['Prepare tonight and keep the usual departure', 'You packed what you needed and checked the route before bed. You kept your usual departure without pretending delays were impossible.', {'vitals.stress':-2}],
      ['Try the earlier journey once and judge the trade-off', 'You planned one earlier commute as an experiment, rather than committing every morning to less sleep.', {'vitals.smarts':1,'vitals.stress':-1}],
    ], {category:'career'}),

  story('ev_uae_offer_allowances', 'What the Package Actually Includes', {minAge:18,countries:['uae'],hasJob:false},
    S => `A recruiter in ${S.city} describes an attractive package. The message combines basic pay and allowances, but it does not explain when each amount is paid or what happens if the role ends.`, [
      ['Ask for the written breakdown and start date', 'You asked for the basic salary, allowances, pay dates and start date in writing. You did not accept a contract or count uncertain pay as cash.', {'skills.charisma':2,'vitals.smarts':1}],
      ['Compare the package with your actual housing and travel costs', 'You compared the proposed package with your own housing and travel needs instead of relying on the headline amount. The offer was still unconfirmed.', {'vitals.stress':-2}],
    ], {category:'career'}),
  story('ev_uae_rental_terms', 'The Rent Is Not the Whole Move', {minAge:18,countries:['uae'],housingModes:['rent']},
    S => `Looking around your rented home in ${S.city}, you start a list for the next move: transport, utility setup, the payment schedule and the money that must remain available afterward. The monthly figure alone is not the whole plan.`, [
      ['Write down the full cash timing before house-hunting', 'You wrote down when money would be due and what needed to stay in reserve. This planning step did not sign a lease or charge a fee.', {'vitals.smarts':2,'vitals.stress':-2}],
      ['Ask for written terms before comparing listings', 'You asked for written terms rather than assuming all rental listings use the same payment schedule. No new lease was signed.', {'skills.charisma':2}],
    ], {category:'money'}),

  story('ev_sau_offer_details', 'The Offer Has More Than One Number', {minAge:18,countries:['sau'],hasJob:false},
    S => `A possible role in ${S.city} comes with a headline salary, but the message says little about the working hours, transport or housing. You have not accepted anything.`, [
      ['Ask for the written breakdown before deciding', 'You asked for the basic pay, any allowances, hours and start date in writing. The role was still only a possibility, not income already in your account.', {'skills.charisma':2,'vitals.stress':-2}],
      ['Compare the commute and rent against the offered amount', 'You compared likely living costs with the offer rather than treating the largest number as take-home pay. No contract was accepted and no money changed hands.', {'vitals.smarts':2}],
    ], {category:'career'}),
  story('ev_sau_guest_space', 'Making Room for Everyone', {minAge:18,countries:['sau'],requiredPeople:['friend']},
    (S,name) => `${name} suggests bringing a few friends over. Before saying yes, you think about the people sharing your home and which space is actually free.`, [
      ['Check with the household before agreeing', "You checked with the household and suggested a time that did not take over someone else's space.", {'skills.charisma':2}, {trust:3}],
      ['Suggest a short outdoor meeting at a cooler time', 'You suggested a short walk at a more comfortable time instead of promising a room that was not yours to offer.', {'vitals.stress':-2}, {affection:2}],
    ], {category:'friends',person:'friend'}),

  story('ev_egy_commute_tradeoff', 'The Route Before the Interview', {minAge:18,countries:['egy'],hasJob:false},
    S => `An interview in ${S.city} is far enough away that the journey needs planning. A cheap route has two changes; the direct ride would leave less money for the rest of the week. The invitation gives you a contact number.`, [
      ['Confirm the address and plan the cheaper route with extra time', 'You confirmed the interview address and wrote down the changes before setting out. Planning did not guarantee the job, but the route was no longer a guess.', {'vitals.stress':-3,'vitals.smarts':1}],
      ['Ask whether a first phone conversation is possible', 'You asked whether the first conversation could happen by phone. The employer had not agreed yet; you had made a clear request rather than spending money you could not spare.', {'skills.charisma':2}],
      ['Check a backup route and keep the invitation number handy', 'You kept a backup route and the interview contact number. A delay would not have to become a silent missed appointment.', {'vitals.stress':-2}]
    ], {category:'career'}),
  story('ev_egy_rental_inventory', 'Before the Keys Change Hands', {minAge:18,countries:['egy'],housingModes:['rent']},
    S => `In your rented home in ${S.city}, a loose cupboard hinge and an old water stain catch your eye. You cannot tell from memory whether they were mentioned when you moved in.`, [
      ['Write down the condition and ask the landlord to acknowledge it', 'You made a clear condition list and asked the landlord to acknowledge the existing damage. It was a record, not a promise that a dispute could never happen.', {'vitals.stress':-3}],
      ['Ask which repairs are yours before agreeing to pay', 'You asked who was responsible for the hinge and water stain before agreeing to a repair bill. No money changed hands.', {'skills.charisma':2}],
    ], {category:'money'}),
  story('ev_egy_family_job_advice', 'A Relative Knows Someone', {minAge:20,countries:['egy'],hasJob:false,requiredPeople:['mom']},
    (S,name) => `${name} mentions someone who might know about work in ${S.city}. She means well, but the role, hours and salary are still unclear. A friendly introduction is not an offer.`, [
      ['Thank her and ask for the actual job details', 'You thanked your mother and asked for the role, hours and salary range before deciding. The introduction remained a possibility, not a job you already had.', {'skills.charisma':2}, {trust:3}],
      ['Keep applying elsewhere while you wait', 'You kept applying elsewhere while the family introduction was uncertain. You did not stake the whole search on a favour.', {'vitals.stress':-2}],
    ], {category:'family',person:'mom'}),

  story('ev_lived_inbox_silence', 'The Inbox Is Still Quiet', techHunt,
    S => `Three applications. Two automatic replies. No interview. It is almost noon in ${S.city}, and the same job has appeared under a third recruiter. You have enough patience left for one more thing.`, [
      ['Drop the duplicate listing and check the other two', 'You spotted a duplicate vacancy and stopped wasting applications on it. The other two still had no answer.', { 'vitals.stress': -5 }],
      ['Spend the hour fixing a weak work sample', 'You fixed the confusing part of your work sample. Nobody had hired you by lunchtime.', { 'skills.creativity': 3, 'vitals.smarts': 2 }],
      ['Keep refreshing until late', 'You kept checking for replies late into the night. Nothing new arrived, and you went to bed tense.', { 'vitals.stress': 5 }],
    ], { category: 'career' }),
  story('ev_lived_interview_practice', 'A Question You Can Actually Answer', techHunt,
    'The application has one question left: "Tell us about a problem you solved." Your first answer sounds impressive. It is also mostly adjectives. The real example is smaller and harder to explain.', [
      ['Delete the adjectives. Use the small, true example.', 'You rewrote the answer around what happened, what you did, and what changed.', { 'skills.charisma': 3, 'vitals.stress': -2 }],
      ['Record a practice answer and listen for what is unclear', 'You rehearsed your own example at a comfortable pace. Practice was preparation, not a promise that nerves would disappear.', { 'skills.charisma': 2 }],
    ], { category: 'career' }),
  story('ev_lived_interview_after', 'After You Press Send',
    { ...techHunt, afterEvent: 'ev_lived_interview_practice', afterEventMinTurns: 1 },
    'You return to the example you prepared. The employer has not promised anything, but the next application no longer starts from a blank page.', [
      ['Reuse the honest example where it fits', 'You kept your real example as a starting point and adapted it to another suitable application.', { 'vitals.stress': -2 }],
      ['Take a proper break before continuing', 'You closed the applications for the evening. Rest did not cancel the work you had already done.', { 'vitals.stress': -5 }],
    ], { category: 'career' }),
  story('ev_lived_comparison', 'Everyone Seems Ahead', { minAge: 18, minYear: 2010 },
    'Three people from your old class post big announcements on the same day. You open the comments, type congratulations, delete it, and open their profiles instead. Twenty minutes disappear.', [
      ['Mute the feed for the rest of the day', 'You muted the feed. The announcements were still there tomorrow; your evening was not.', { 'vitals.stress': -4 }],
      ['Send the congratulations. Leave the profiles closed.', 'You sent congratulations and resisted checking everyone else from your class.', { 'vitals.happiness': 3, 'vitals.stress': -3 }],
    ]),
  story('ev_lived_friend_news', 'Good News, Complicated Feelings', friend,
    (S, name) => `${name} has good news and wants to tell you first. You are pleased, but part of you wonders when something will finally go your way. Both feelings arrive together.`, [
      ['Congratulate them, then be honest that your week is hard', 'You celebrated your friend\'s news without pretending your own week was easy. There was room for both.', { 'vitals.happiness': 3, 'vitals.stress': -2 }, { affection: 5, trust: 4 }],
      ['Send a warm congratulations and take some space', 'You sent a sincere congratulations and gave yourself a quiet evening rather than forcing a celebration.', { 'vitals.stress': -3 }, { affection: 2 }],
    ], { category: 'friends', person: 'friend' }),
  story('ev_lived_mom_tea', 'No Advice This Time', { ...adult, requiredPeople: ['mom'] },
    (S, name) => `${name} finds you sitting quietly at home in ${S.city}. Instead of asking for an update, she asks whether you want a cup of tea and some company.`, [
      ['Sit together without turning it into a progress report', 'You shared a quiet cup with your mother. For once, being together did not require good news.', { 'vitals.stress': -5, 'vitals.happiness': 3 }, { affection: 6, trust: 3 }],
      ['Tell her what has been weighing on you', 'You told your mother what had been weighing on you and asked her to listen before offering advice.', { 'vitals.stress': -4 }, { trust: 6 }],
    ], { category: 'family', person: 'mom' }),
  story('ev_lived_dad_skill', 'The Thing He Never Mentioned', { minAge: 14, requiredPeople: ['dad'] },
    (S, name) => `While sorting a drawer, ${name} shows you something he once made by hand. You realise there are chapters of your father's life you have never asked about.`, [
      ['Ask how he learned it', 'You asked your father about a skill he rarely talked about. An ordinary afternoon became a story you wanted to remember.', { 'skills.creativity': 3, 'vitals.happiness': 3 }, { affection: 5, respect: 4 }],
      ['Try making something together', 'You spent an afternoon trying your father\'s old skill together. Your first attempt was uneven, and worth keeping.', { 'skills.creativity': 4 }, { affection: 6 }],
    ], { category: 'family', person: 'dad' }),
  ...['dad', 'mom'].map(role => story(`ev_lived_grief_${role}`, 'The Habit of Telling Them',
    { minAge: 14, deceasedParent: role }, S => {
      const person = S.people[S.relations[role === 'dad' ? 'fatherId' : 'motherId']];
      return `Something small happens in ${S.city}, and for a second you want to tell ${person?.firstName || (role === 'dad' ? 'your father' : 'your mother')}. Then you remember they have died. Grief has interrupted an ordinary day, not waited for an anniversary.`;
    }, [
      ['Write down what you wanted to tell them', 'You wrote down the small thing you had wanted to share with your late parent. The loss remained, but the memory had somewhere to go.', { 'vitals.stress': -3 }],
      ['Make room for a quiet day', 'You gave yourself a quieter day after a reminder of your late parent. You did not demand that grief follow a timetable.', { 'vitals.stress': -4 }],
    ], { category: 'family' })),
  story('ev_lived_sibling_paths', 'Same Home, Different Lives', { ...adult, requiredPeople: ['sib'] },
    (S, name) => `${name} remembers a family moment completely differently from you. For a minute it sounds like you grew up in different houses.`, [
      ['Listen before defending your version', 'You listened to your sibling\'s version of growing up and discovered something you had missed.', { 'skills.charisma': 2 }, { trust: 5 }],
      ['Trade the funny parts rather than settle the argument', 'You and your sibling traded the funny parts of an old memory and left the argument unfinished.', { 'vitals.happiness': 4 }, { affection: 4 }],
    ], { category: 'family', person: 'sib' }),
  story('ev_lived_cafe_notebook', 'A Table by the Window', adult,
    S => `Passing ${localPlace(S)} in ${S.city}, you stop outside the window. You do not need to buy anything today. A loose idea has been following you around, and there is a bench nearby where you could finally write it down.`, [
      ['Sketch the smallest version you could actually finish', 'You turned a vague idea into a small, finishable plan on a scrap of paper.', { 'skills.creativity': 4 }],
      ['Enjoy the walk without making it productive', 'You let a walk be a walk. Nothing was earned or fixed, and the afternoon still counted.', { 'vitals.stress': -5, 'vitals.health': 1 }],
    ]),
  story('ev_lived_small_project', 'It Works, Even If It Is Ugly', { minAge: 16, minYear: 2005 },
    'The little project runs. One button is crooked, the colours clash, and you have already thought of six new features. The version on screen does one useful thing. You have an hour left.', [
      ['Fix the crooked button. Do not add a feature.', 'You saved a working version and fixed the button. The six new features stayed on paper.', { 'skills.creativity': 4 }],
      ['Show it to someone before polishing it', 'You showed the unfinished project to someone and watched where they got stuck. It was not the button.', { 'skills.charisma': 2, 'skills.creativity': 3 }],
    ]),
  story('ev_lived_project_followup', 'One Detail Someone Noticed',
    { minAge: 16, minYear: 2005, afterEvent: 'ev_lived_small_project', afterEventMinTurns: 2 },
    'Looking at your small project again, you notice one detail that is much better than the first version. It is not fame or income. It is evidence that you can improve something by staying with it.', [
      ['Finish a modest version before adding more', 'You gave the project a modest finish line and reached it. The finished version was smaller than the dream, and real.', { 'vitals.happiness': 4 }],
      ['Keep it as a hobby with no pressure to earn', 'You kept the project as something you enjoyed, without making it responsible for your whole future.', { 'vitals.stress': -4, 'skills.creativity': 2 }],
    ]),
  story('ev_lived_work_credit', 'Your Name Is Missing', { minAge: 18, hasJob: true },
    'The team update goes out. Your work is in the second paragraph; your name is not. There is a reply-all button and a private message window. Both are open.', [
      ['Reply-all with a short correction', 'You replied to the team with the part you handled. Your name was on the thread now. So was the correction.', { 'skills.charisma': 3, 'vitals.stress': 3 }],
      ['Ask the sender privately to add your name', 'You asked the sender privately to add your name next time. The original update stayed as it was.', { 'skills.charisma': 2, 'vitals.happiness': -1 }],
    ], { category: 'career' }),
  story('ev_lived_study_wrong_page', 'The Page You Read Three Times', { minAge: 8, education: ['inSchool', 'inUni'] },
    'Your notes say "important" beside a paragraph you cannot explain. There are two more pages and a question sheet. You could copy the paragraph neatly and still understand none of it.', [
      ['Close the book and explain it from memory', 'You found the gap in your understanding by trying to explain the lesson in your own words.', { 'vitals.smarts': 3 }],
      ['Skip the notes and attempt the first question', 'You returned from a short break and worked through one question rather than staring at the page.', { 'vitals.stress': -3, 'vitals.smarts': 2 }],
    ], { category: 'school' }),
  story('ev_lived_abroad_home', 'Two Places Feel Like Home', { minAge: 18, abroad: true },
    S => `In ${S.city}, you catch yourself using a local expression without thinking. Then a familiar smell reminds you of ${S.homeCity || 'where you grew up'}. Belonging here has not stopped you missing there.`, [
      ['Keep a small ritual from home and try a new local one', 'You made room for a familiar ritual and a new local habit without choosing which place mattered more.', { 'vitals.happiness': 4, 'vitals.stress': -2 }],
      ['Write about what each place has taught you', 'You wrote about the different parts of yourself that each place had brought out.', { 'skills.creativity': 3, 'vitals.stress': -2 }],
    ]),
  story('ev_lived_friend_walk', 'Company Without an Occasion', friend,
    (S, name) => `${name} asks if you want to walk around ${S.city} with no booking, no celebration and no reason to spend money. Just an hour outside together.`, [
      ['Go, and put the updates aside for a while', 'You took a free walk with your friend and talked about things that were not progress reports.', { 'vitals.happiness': 4, 'vitals.stress': -4 }, { affection: 5 }],
      ['Say you need quiet, and suggest another day', 'You told your friend honestly that you needed quiet instead of disappearing without a reply.', { 'vitals.stress': -3 }, { trust: 3 }],
    ], { category: 'friends', person: 'friend' }),
  story('ev_lived_partner_team', 'A Plan That Belongs to Both of You', { minAge: 18, requiredPeople: ['spouse'] },
    (S, name) => `You and ${name} have both been calling the next few months "busy". Tonight you realise you have been imagining different futures and never compared notes.`, [
      ['Make one small shared plan and leave room for changes', 'You and your partner compared hopes and made one small plan you both wanted.', { 'vitals.stress': -3, 'vitals.happiness': 3 }, { trust: 6, affection: 3 }],
      ['Ask what they need before explaining your own plan', 'You listened to what your partner needed before defending the future you had imagined.', { 'skills.charisma': 2 }, { trust: 5 }],
    ], { category: 'relationship', person: 'spouse' }),
  story('ev_lived_rooftop_sky', 'The City Looks Up', { minAge: 10 },
    S => `A clear night over ${S.city} turns a patch of sky between buildings into a small spectacle. Someone points out a bright planet; you realise you have walked under it all week without noticing.`, [
      ['Learn how to find it again tomorrow', 'You learned to recognise one bright planet above your city. The walk home had a new landmark.', { 'vitals.smarts': 2, 'vitals.happiness': 4 }],
      ['Stay a little longer without naming everything', 'You stayed outside watching the sky, with no need to turn the moment into an achievement.', { 'vitals.stress': -5 }],
    ]),
  story('ev_lived_repair_table', 'The Repair Table', { minAge: 16 },
    S => `A free community repair session in ${S.city} has a table covered with loose screws and handwritten labels. A volunteer invites you to help sort the parts. Nobody expects you to be an expert.`, [
      ['Ask to learn one simple repair', 'At a free repair session, you learned one simple fix and left with more confidence in your hands.', { 'skills.creativity': 4 }],
      ['Help organise the parts so other people can work', 'You sorted parts at a community repair table. Being useful did not require being the most skilled person there.', { 'vitals.happiness': 4, 'skills.charisma': 2 }],
    ]),
  story('ev_lived_future_letter', 'A Letter to a Later You', { minAge: 14 },
    'You find an old page where you described what you thought life would be like by now. Some of it is funny. One line still matters more than you expected.', [
      ['Write back with what you know now', 'You wrote an answer to an earlier version of yourself, keeping the hope but dropping the impossible timetable.', { 'skills.creativity': 3, 'vitals.stress': -3 }],
      ['Keep one promise small enough to do this week', 'You chose one small promise from an old page and gave it a realistic place in the coming week.', { }],
    ]),
  story('ev_lived_child_question', 'An Unexpectedly Good Question', { minAge: 25, requiredPeople: ['child'] },
    (S, name) => `${name} asks what you wanted to be before life became complicated. You start giving the sensible answer, then pause.`, [
      ['Tell the real story, including the parts that changed', 'You told your child how your hopes had changed over time, without pretending that every turn had been planned.', { 'vitals.happiness': 3 }, { trust: 5, affection: 4 }],
      ['Ask what they would like to try, without choosing for them', 'You listened to what your child wanted to try and left room for the answer to change.', { 'skills.charisma': 2 }, { trust: 6 }],
    ], { category: 'children', person: 'child' }),

];
