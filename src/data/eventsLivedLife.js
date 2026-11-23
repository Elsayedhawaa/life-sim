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
  story('ev_lived_inbox_silence', 'The Inbox Is Still Quiet', techHunt,
    S => `You have spent another morning looking for work in ${S.city}. The inbox is quiet, but the effort was real. You can spend the next hour chasing every listing or give the search some structure.`, [
      ['Track a few suitable applications, then stop for today', 'You made a short job-search plan and stopped checking the inbox for the evening. No offer yet, but the next step was clear.', { 'vitals.stress': -5, 'skills.discipline': 3 }],
      ['Improve one work sample instead of refreshing', 'You turned a restless hour into one clearer work sample. It did not guarantee an interview, but it was something you could show.', { 'skills.creativity': 3, 'vitals.smarts': 2 }],
      ['Keep refreshing until late', 'You kept checking for replies late into the night. Nothing new arrived, and you went to bed tense.', { 'vitals.stress': 5 }],
    ], { category: 'career' }),
  story('ev_lived_interview_practice', 'A Question You Can Actually Answer', techHunt,
    'An application asks for an example of solving a problem. You keep starting with what you lack, then remember a small problem you really did solve.', [
      ['Write the true example in plain words', 'You wrote a clear example of a real problem you solved, without inventing experience.', { 'skills.charisma': 3, 'vitals.stress': -2 }],
      ['Practise saying it slowly, without chasing perfection', 'You rehearsed your own example at a comfortable pace. Practice was preparation, not a promise that nerves would disappear.', { 'skills.charisma': 2, 'skills.discipline': 2 }],
    ], { category: 'career' }),
  story('ev_lived_interview_after', 'After You Press Send',
    { ...techHunt, afterEvent: 'ev_lived_interview_practice', afterEventMinTurns: 1 },
    'You return to the example you prepared. The employer has not promised anything, but the next application no longer starts from a blank page.', [
      ['Reuse the honest example where it fits', 'You kept your real example as a starting point and adapted it to another suitable application.', { 'skills.discipline': 3, 'vitals.stress': -2 }],
      ['Take a proper break before continuing', 'You closed the applications for the evening. Rest did not cancel the work you had already done.', { 'vitals.stress': -5 }],
    ], { category: 'career' }),
  story('ev_lived_comparison', 'Everyone Seems Ahead', { minAge: 18, minYear: 2010 },
    'A feed full of promotions, weddings and perfect holidays makes your own ordinary afternoon feel like evidence against you. Then you notice how little of anybody else\'s day you can actually see.', [
      ['Close the feed and pick one small thing you control', 'You put the feed away and finished one manageable task. Other people\'s announcements stopped setting the pace for your evening.', { 'vitals.stress': -4, 'skills.discipline': 2 }],
      ['Enjoy their good news without grading your own life', 'You let someone else have a good day without turning it into a verdict on your own.', { 'vitals.happiness': 3, 'vitals.stress': -3 }],
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
      ['Sketch the smallest version you could actually finish', 'You turned a vague idea into a small, finishable plan on a scrap of paper.', { 'skills.creativity': 4, 'skills.discipline': 2 }],
      ['Enjoy the walk without making it productive', 'You let a walk be a walk. Nothing was earned or fixed, and the afternoon still counted.', { 'vitals.stress': -5, 'vitals.health': 1 }],
    ]),
  story('ev_lived_small_project', 'It Works, Even If It Is Ugly', { minAge: 16, minYear: 2005 },
    'A tiny digital project finally does the one thing you wanted. The layout is awkward and half the ideas are missing, but it works. Now comes the temptation to start over instead of finishing.', [
      ['Keep a working copy and fix one rough edge', 'You saved a working copy and improved one rough edge instead of rebuilding everything.', { 'skills.creativity': 4, 'skills.discipline': 3 }],
      ['Ask one person for specific feedback', 'You asked for feedback on one clear question rather than whether the whole project was good.', { 'skills.charisma': 2, 'skills.creativity': 3 }],
    ]),
  story('ev_lived_project_followup', 'One Detail Someone Noticed',
    { minAge: 16, minYear: 2005, afterEvent: 'ev_lived_small_project', afterEventMinTurns: 2 },
    'Looking at your small project again, you notice one detail that is much better than the first version. It is not fame or income. It is evidence that you can improve something by staying with it.', [
      ['Finish a modest version before adding more', 'You gave the project a modest finish line and reached it. The finished version was smaller than the dream, and real.', { 'skills.discipline': 4, 'vitals.happiness': 4 }],
      ['Keep it as a hobby with no pressure to earn', 'You kept the project as something you enjoyed, without making it responsible for your whole future.', { 'vitals.stress': -4, 'skills.creativity': 2 }],
    ]),
  story('ev_lived_work_credit', 'Your Name Is Missing', { minAge: 18, hasJob: true },
    'At work, an update mentions the task you helped finish but leaves out your part. It might be an oversight. You want the record corrected without turning the room into a fight.', [
      ['Send a calm factual note about your contribution', 'You documented your contribution calmly. The record was clearer, without inventing a promotion or a pay rise.', { 'skills.charisma': 3, 'skills.discipline': 2 }],
      ['Ask privately before assuming intent', 'You asked privately about the missing credit instead of guessing why it happened.', { 'skills.charisma': 3, 'vitals.stress': -2 }],
    ], { category: 'career' }),
  story('ev_lived_study_wrong_page', 'The Page You Read Three Times', { minAge: 8, education: ['inSchool', 'inUni'] },
    'You have read the same page three times and still cannot explain it. The problem is no longer how long you have been sitting there, but what would help it make sense.', [
      ['Explain it aloud with a simple example', 'You found the gap in your understanding by trying to explain the lesson in your own words.', { 'vitals.smarts': 3, 'skills.discipline': 2 }],
      ['Take a short break, then try one practice question', 'You returned from a short break and worked through one question rather than staring at the page.', { 'vitals.stress': -3, 'vitals.smarts': 2 }],
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
      ['Ask to learn one simple repair', 'At a free repair session, you learned one simple fix and left with more confidence in your hands.', { 'skills.creativity': 4, 'skills.discipline': 2 }],
      ['Help organise the parts so other people can work', 'You sorted parts at a community repair table. Being useful did not require being the most skilled person there.', { 'vitals.happiness': 4, 'skills.charisma': 2 }],
    ]),
  story('ev_lived_future_letter', 'A Letter to a Later You', { minAge: 14 },
    'You find an old page where you described what you thought life would be like by now. Some of it is funny. One line still matters more than you expected.', [
      ['Write back with what you know now', 'You wrote an answer to an earlier version of yourself, keeping the hope but dropping the impossible timetable.', { 'skills.creativity': 3, 'vitals.stress': -3 }],
      ['Keep one promise small enough to do this week', 'You chose one small promise from an old page and gave it a realistic place in the coming week.', { 'skills.discipline': 4 }],
    ]),
  story('ev_lived_child_question', 'An Unexpectedly Good Question', { minAge: 25, requiredPeople: ['child'] },
    (S, name) => `${name} asks what you wanted to be before life became complicated. You start giving the sensible answer, then pause.`, [
      ['Tell the real story, including the parts that changed', 'You told your child how your hopes had changed over time, without pretending that every turn had been planned.', { 'vitals.happiness': 3 }, { trust: 5, affection: 4 }],
      ['Ask what they would like to try, without choosing for them', 'You listened to what your child wanted to try and left room for the answer to change.', { 'skills.charisma': 2 }, { trust: 6 }],
    ], { category: 'children', person: 'child' }),

];
