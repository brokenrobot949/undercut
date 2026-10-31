// Shop tab (home): "While you were away", commissions, town crier, and the
// Trade Guild with its skill trainer.

import { el, coins, comingSoon, formatDuration, countdown, toast, coinText, itemIcon, uiIcon } from './components.js';
import { commissionTypes, commissionTuning } from '../../data/commissions.js';
import { raceById, classById } from '../../data/races.js';
import { commissionSlots, canDeliver, deliverCommission, declineCommission, recipeHint, claimTutorialStep } from '../engine/commissions.js';
import { tutorialStep, stepMet } from '../engine/tutorial.js';
import { tutorialSteps, tutorialMentor } from '../../data/tutorial.js';
import { madeCount } from '../engine/bags.js';
import { openItemSheet } from './item-sheet.js';
import { getFaction, getStanding } from '../engine/game.js';
import { standingLadder } from '../engine/guild.js';
import { guildTips } from '../../data/guild.js';
import { tuning } from '../../data/tuning.js';
import { upgrades } from '../../data/upgrades.js';
import { nextWing, buyWing } from '../engine/wings.js';
import { quartermasterRecipes, buyQuartermasterRecipe } from '../engine/quartermaster.js';
import { activeEvents, crierLine, glutLeft, upcomingEvents } from '../engine/events.js';
import { upgradeById } from '../../data/upgrades.js';
const eventWarnHoursAt3 = upgradeById.ledger.warnHours;
import { eventById } from '../../data/events.js';
import { upgradeLevel, nextUpgrade, buyUpgrade, queueSlotsFor, craftTimeMult, bonusBarChance, bagSlotsFor, cutRate, depositMult,
  listingSlotsFor, boardSizeFor, expeditionSlotsFor, commissionPayMult, eventWarnHours } from '../engine/upgrades.js';
import { itemById } from '../../data/items.js';
import { professions, professionById } from '../../data/professions.js';
import { nextTraining, trainRank, trainerRecipes, learnRecipe, recipeColor, hasProfession, recipeProfession } from '../engine/skills.js';
import { colorText, nextGoal } from './skill-bar.js';
import { skillBar } from './skill-bar.js';

export function renderShop(ctx) {
  const { state } = ctx;
  const faction = getFaction(state);
  const mailboxFull = state.mailbox.copper > 0 || Object.keys(state.mailbox.items).length > 0;

  return el('div', { class: 'main-inner' },
    ctx.away || mailboxFull ? awayPanel(ctx) : null,
    goalPanel(ctx),
    commissionPanel(ctx),
    crierPanel(ctx),
    el('section', { class: 'panel guild' },
      el('h2', {}, faction.guild),
      standingBlock(ctx),
      el('h3', { id: 'trainer' }, 'Trainer'),
      el('p', { class: 'small dim' }, 'Each rank lets your skill climb higher. Train the next one once you reach the cap. Recipes go on sale as your skill reaches them.'),
      professions.filter((p) => hasProfession(ctx.state, p.id)).flatMap((p) => [trainerRow(ctx, p.id), recipeOffers(ctx, p.id)]),
      el('h3', {}, 'Quartermaster'),
      el('p', { class: 'small dim' }, `Better recipes for members in good standing, from ${tuning.standings[1].name}. Blue-quality ones from ${tuning.standings[2].name}, and masterworks (epic) at ${tuning.standings[4].name}.`),
      quartermasterOffers(ctx),
    ),
    upgradesPanel(ctx),
  );
}

// Shop upgrades: one row each with its level, what it does now and next, and a buy button.
function upgradesPanel(ctx) {
  const { state } = ctx;
  return el('section', { class: 'panel' },
    el('h2', {}, 'Shop upgrades'),
    el('p', { class: 'small dim' }, 'Spend gold to grow your shop. Higher levels need better standing with the guild.'),
    el('div', { class: 'upgrade-list' }, wingRow(ctx), upgrades.map((u) => {
      const level = upgradeLevel(state, u.id);
      const n = nextUpgrade(state, u.id);
      const nextState = n && { ...state, upgrades: { ...state.upgrades, [u.id]: n.level } };
      return el('div', { class: 'upgrade-row' },
        el('div', { class: 'upgrade-head' },
          el('strong', {}, u.name),
          el('span', { class: 'small dim' }, `Level ${level} / ${u.levels}`)),
        el('p', { class: 'small dim' }, u.blurb),
        el('p', { class: 'small' }, 'Now: ', upgradeEffect(state, u.id),
          n ? el('span', { class: 'dim' }, ` → next: ${upgradeEffect(nextState, u.id)}`) : null),
        n ? el('button', { class: `btn wide${n.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !n.ready,
          onclick: () => ctx.act((s) => {
            buyUpgrade(s, u.id);
            toast(`${u.name} is now level ${n.level}.${u.id === 'table' ? ' The extra hero arrives at the next board refresh.' : ''}`);
          }) }, `Upgrade to level ${n.level} · `, coins(n.cost)) : el('p', { class: 'small' }, 'Top level reached.'),
        n && !n.ready ? el('p', { class: 'small dim' }, n.reason) : null);
    })));
}

// Profession wing: pick which profession the next wing opens.
function wingRow(ctx) {
  const { state } = ctx;
  const n = nextWing(state);
  const owned = state.player.professions.length;
  return el('div', { class: 'upgrade-row' },
    el('div', { class: 'upgrade-head' },
      el('strong', {}, 'Profession wing'),
      el('span', { class: 'small dim' }, `${owned} / ${professions.length} professions`)),
    el('p', { class: 'small dim' }, n
      ? `Opens a new profession, with its workstation and starter materials. Costs `
      : 'Your shop has every profession.', n ? coins(n.cost) : null, n ? '.' : null),
    n ? n.choices.map((p) => el('button', { class: `btn wide${n.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !n.ready,
      onclick: () => ctx.act((s) => {
        buyWing(s, p.id);
        toast(`Your ${p.name} wing is open. Find it in the Workshop.`);
      }) }, `Open ${p.name}`)) : null,
    n && !n.ready ? el('p', { class: 'small dim' }, n.reason) : null);
}

// What an upgrade does at the level in `state`, as a short phrase.
function upgradeEffect(state, id) {
  const pct = (x) => `${+(x * 100).toFixed(1)}%`;
  switch (id) {
    case 'queue': return `${queueSlotsFor(state)} orders per workstation`;
    case 'tools': return craftTimeMult(state, 'anvil') < 1 ? `crafting ${pct(1 - craftTimeMult(state, 'anvil'))} faster` : 'normal crafting speed';
    case 'bellows': return `${craftTimeMult(state, 'forge') < 1 ? `smelting ${pct(1 - craftTimeMult(state, 'forge'))} faster` : 'normal smelting speed'}${bonusBarChance(state) ? `, ${pct(bonusBarChance(state))} bonus-bar chance` : ''}`;
    case 'bags': return `${bagSlotsFor(state)} bag slots`;
    case 'seal': return `${pct(cutRate(state))} cut${depositMult(state) < 1 ? `, deposits ${pct(1 - depositMult(state))} cheaper` : ''}`;
    case 'listings': return `${listingSlotsFor(state)} listing slots`;
    case 'table': return `${boardSizeFor(state)} heroes on the board`;
    case 'charter': return `${expeditionSlotsFor(state)} heroes out at once`;
    case 'counter': return `${commissionSlots(state)} commission slots${commissionPayMult(state) > 1 ? `, pay +${pct(commissionPayMult(state) - 1)}` : ''}`;
    case 'ledger': return ['no price history', '7-day price charts', 'price charts and sell-time estimates', `charts, estimates and event warnings ${eventWarnHoursAt3} h early`][upgradeLevel(state, 'ledger')];
    default: return '';
  }
}

// The town crier: market events running now, and when each one ends. With
// the top-level Ledger, also the ones starting soon.
function crierPanel(ctx) {
  // A glut that has sold out is over as far as the player cares.
  const running = activeEvents(ctx.state).filter((e) => eventById[e.type].kind !== 'glut' || glutLeft(ctx.state, e) > 0);
  const warn = eventWarnHours(ctx.state);
  const soon = warn ? upcomingEvents(ctx.state, ctx.now(), warn) : [];
  return el('section', { class: 'panel crier' },
    el('h2', {}, 'Town crier'),
    running.length ? el('ul', { class: 'crier-list' }, running.map((e) => el('li', {},
      el('p', {}, crierLine(e)),
      el('p', { class: 'small dim' },
        e.itemId ? [el('button', { class: 'link', type: 'button', onclick: () => openItemSheet(ctx, e.itemId) }, itemById[e.itemId].name), ' · '] : null,
        eventById[e.type].kind !== 'glut' ? ['Ends in ', countdown(e.endsAt)]
          : [`${glutLeft(ctx.state, e)} left · gone in at most `, countdown(e.endsAt)]))))
      : el('p', { class: 'dim' }, 'No news in the city today. A quiet market.'),
    soon.length ? [el('h3', {}, 'Coming soon (from your Ledger)'), el('ul', { class: 'crier-list' }, soon.map((e) => el('li', {},
      el('p', {}, eventById[e.type].name),
      el('p', { class: 'small dim' }, 'Starts in ', countdown(e.startsAt)))))] : null);
}

// Your standing, progress to the next one, what it unlocks, and the full ladder.
function standingBlock(ctx) {
  const { state } = ctx;
  const { current, next, share } = getStanding(state);
  const ladder = standingLadder(state);
  const nextStep = next && ladder.find((s) => s.id === next.id);
  return el('div', { class: 'standing-block' },
    el('div', { class: 'standing-head' },
      el('strong', { class: 'standing-name' }, current.name),
      el('span', { class: 'small dim' }, next
        ? `${state.reputation.toLocaleString()} / ${next.rep.toLocaleString()} reputation`
        : `${state.reputation.toLocaleString()} reputation`)),
    el('div', { class: 'bar progress', role: 'progressbar', 'aria-label': 'Progress to next standing',
      'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(share * 100)) },
      el('span', { style: `width:${share * 100}%` })),
    nextStep
      ? el('div', { class: 'next-unlock' },
        el('p', { class: 'small' }, el('strong', {}, `${next.name} unlocks:`),
          ` ${(next.rep - state.reputation).toLocaleString()} reputation to go`),
        unlockList(nextStep.unlocks))
      : el('p', { class: 'small' }, guildTips.top),
    el('p', { class: 'small dim' }, guildTips.earn),
    el('details', { class: 'standing-ladder' },
      el('summary', {}, 'All standings'),
      el('ol', {}, ladder.map((s) => el('li', { class: s.reached ? 'reached' : '' },
        el('div', { class: 'ladder-head' },
          el('span', {}, s.reached ? '✓ ' : '', el('strong', {}, s.name)),
          el('span', { class: 'small dim' }, s.rep ? `${s.rep.toLocaleString()} rep` : 'Start')),
        unlockList(s.unlocks))))),
  );
}

function unlockList(unlocks) {
  return el('ul', { class: 'unlock-list small' }, unlocks.map((u) =>
    el('li', {}, u.text, u.soon ? el('span', { class: 'soon-tag' }, 'coming soon') : null)));
}

// Recipes the quartermaster sells for your professions.
function quartermasterOffers(ctx) {
  const offers = quartermasterRecipes(ctx.state);
  if (!offers.length) return el('p', { class: 'small dim' }, 'You know every recipe the quartermaster sells for your professions.');
  return el('div', { class: 'market-list trainer-recipes' }, offers.map((o) => {
    const out = itemById[o.recipe.makes.item];
    return el('div', { class: 'my-listing with-icon' },
      itemIcon(out.id, 'sm'),
      el('button', { class: `link item-name q-${out.quality}`, type: 'button', onclick: () => openItemSheet(ctx, out.id) }, out.name),
      el('button', { class: `btn small-btn${o.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !o.ready,
        onclick: () => ctx.act((s) => {
          buyQuartermasterRecipe(s, o.recipe.id);
          toast(`Learned ${out.name}. Find it in the Workshop.`);
        }) }, 'Learn ', coins(o.cost)),
      el('span', { class: 'small dim market-sub' }, `${professionById[recipeProfession(o.recipe)].name} · `, o.reason ?? `skill ${o.recipe.skill[0]}`));
  }));
}

// Recipes the trainer sells: everything you can learn now, then the next few.
function recipeOffers(ctx, professionId) {
  const offers = trainerRecipes(ctx.state, professionId);
  if (!offers.length) return el('p', { class: 'small dim' }, 'You know every recipe the trainer sells.');
  const skill = ctx.state.skills[professionId].skill;
  // Recipes that still give skill-ups, then the next few; gray ones fold away.
  const gray = offers.filter((o) => recipeColor(ctx.state, o.recipe) === 'gray');
  const shown = [...offers.filter((o) => o.recipe.skill[0] <= skill && !gray.includes(o)), ...offers.filter((o) => o.recipe.skill[0] > skill).slice(0, 3)];
  const row = (o) => {
    const out = itemById[o.recipe.makes.item];
    const color = recipeColor(ctx.state, o.recipe);
    return el('div', { class: `my-listing skill-${color}` },
      el('span', { class: `item-name skill-text-${color}` }, out.name),
      el('button', { class: `btn small-btn${o.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !o.ready,
        onclick: () => ctx.act((s) => learnRecipe(s, o.recipe.id)) }, 'Learn ', coins(o.cost)),
      el('span', { class: 'small dim market-sub' }, color === 'red' ? colorText(o.recipe, color) : o.reason || colorText(o.recipe, color)));
  };
  return [
    shown.length ? el('div', { class: 'market-list trainer-recipes' }, shown.map(row)) : null,
    gray.length ? el('details', { class: 'older-recipes' },
      el('summary', { class: 'small' }, `${gray.length} older recipe${gray.length > 1 ? 's' : ''} (no skill-ups, still sellable)`),
      el('div', { class: 'market-list trainer-recipes' }, gray.map(row))) : null,
  ];
}

function trainerRow(ctx, professionId) {
  const t = nextTraining(ctx.state, professionId);
  return el('div', { class: 'trainer-row' },
    skillBar(ctx.state, professionId),
    t ? el('button', { class: `btn wide${t.ready ? ' btn-primary' : ''}`, type: 'button', disabled: !t.ready,
      onclick: () => ctx.act((s) => trainRank(s, professionId)) },
      `Train ${t.rank.name} (skill to ${t.rank.cap}) · `, t.cost ? coins(t.cost) : 'free') : el('p', { class: 'small dim' }, 'Highest rank trained.'),
    t && !t.ready ? el('p', { class: 'small dim' }, t.reason) : null);
}

// The commission counter: requests from heroes, paid in gold and reputation.
// Only items you made yourself count.
// What to aim for next, once the tutorial is done.
function goalPanel(ctx) {
  const g = nextGoal(ctx.state);
  if (!g) return null;
  return el('section', { class: 'panel goal' },
    el('p', {}, el('strong', {}, 'Next goal: '), g.text, g.cost !== undefined ? coins(g.cost) : null, g.after ?? ''));
}

function commissionPanel(ctx) {
  const { list } = ctx.state.commissions;
  return el('section', { class: 'panel' },
    el('h2', {}, `Commission counter (${list.length} / ${commissionSlots(ctx.state)})`),
    el('p', { class: 'small dim' }, `Heroes post requests here, about one every ${commissionTuning.postEveryHours} hours. They pay well, and they're how you earn standing with the guild. Only items you crafted count.`),
    tutorialStep(ctx.state) ? tutorialCard(ctx) : null,
    list.length ? el('div', { class: 'commission-list' }, list.map((c) => commissionCard(ctx, c)))
      : tutorialStep(ctx.state) ? null : el('p', { class: 'small dim' }, 'No requests right now. A new one will be posted soon.'));
}

// Where each tutorial goal is done, for the "Show me" button.
const TAB_NAMES = { workshop: 'the Workshop', auction: 'the Auction House', tavern: 'the Tavern', shop: 'the trainer' };
export const TUTORIAL_TABS = { craft: 'workshop', smelt: 'workshop', list: 'auction', buy: 'auction', hire: 'tavern', learn: 'shop' };

// The tutorial: one step at a time from the quartermaster. Do it anywhere, then claim it here.
function tutorialCard(ctx) {
  const { state } = ctx;
  const step = tutorialStep(state);
  const total = tutorialSteps[state.tutorial.professionId].length;
  const met = stepMet(state);
  return el('div', { class: `commission-card tutorial-card${met ? ' met' : ''}` },
    el('div', { class: 'commission-head' },
      el('span', { class: 'commission-type' }, step.title),
      el('span', { class: 'small dim' }, `Step ${state.tutorial.step + 1} of ${total}`)),
    el('p', { class: 'small' }, `${tutorialMentor.name}, ${tutorialMentor.title}:`),
    el('p', {}, step.text),
    el('p', { class: 'small' }, 'Reward: ', coins(step.pay), ` and ${step.rep} reputation.`),
    met
      ? el('button', { class: 'btn wide btn-primary', type: 'button', onclick: () => {
        const s = ctx.act((st, now) => claimTutorialStep(st, now));
        if (s && s.pay) toast(`+${coinText(s.pay)}, +${s.rep} reputation.`);
      } }, 'Done! Claim reward')
      : el('button', { class: 'btn wide', type: 'button', onclick: () => {
        const tab = TUTORIAL_TABS[step.goal];
        if (tab === 'shop') document.getElementById('trainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else ctx.goTab(tab);
      } }, `Show me: ${TAB_NAMES[TUTORIAL_TABS[step.goal]]}`));
}

function requesterText(c) {
  const r = c.requester;
  if (!r.race) return r.name;
  return `${r.name}, ${raceById[r.race].name} ${classById[r.classId].name}, level ${r.level}${r.regularId ? ' (your regular)' : ''}`;
}

function commissionCard(ctx, c) {
  const { state } = ctx;
  const type = commissionTypes.find((t) => t.id === c.type);
  const item = itemById[c.itemId];
  const left = c.qty - c.delivered;
  const made = madeCount(state, c.itemId);
  const n = canDeliver(state, c);
  const partial = !!commissionTypes.find((t) => t.id === c.type)?.partial;
  const ready = partial ? n > 0 : n >= left;
  const hint = recipeHint(state, c);
  return el('div', { class: `commission-card type-${c.type}` },
    el('div', { class: 'commission-head' },
      el('span', { class: 'commission-type' }, type.name),
      el('span', { class: 'small dim' }, 'Ends in ', countdown(c.expiresAt))),
    el('p', { class: 'small' }, requesterText(c), ' wants'),
    el('p', { class: 'commission-item' }, itemIcon(item.id, 'sm'), el('strong', {}, `${c.qty} × `),
      el('button', { class: `link q-${item.quality}`, type: 'button', onclick: () => openItemSheet(ctx, item.id) }, item.name)),
    el('p', { class: 'small' }, 'Pays ', coins(c.pay), ` and ${c.rep} reputation`,
      partial ? ` (paid by the part, ${c.delivered} of ${c.qty} delivered)` : '',
      c.type === 'regular' ? ', plus loyalty and 3 levels for your regular' : '', '.'),
    el('p', { class: 'small dim' }, `You've made ${made} in your bags.`, hint ? ` ${hint}` : ''),
    el('div', { class: 'btn-row' },
      el('button', { class: `btn${ready ? ' btn-primary' : ''}`, type: 'button', disabled: !ready, onclick: () => {
        const r = ctx.act((s, now) => deliverCommission(s, c.id, now));
        if (r && r.copper !== undefined) toast(`Handed in. +${coinText(r.copper)}, +${r.rep} reputation.`);
      } }, partial && n > 0 && n < left ? `Deliver ${n}` : 'Hand in'),
      el('button', { class: 'btn', type: 'button', onclick: () => ctx.act((s) => declineCommission(s, c.id)) }, 'Decline')));
}

function awayPanel(ctx) {
  const s = ctx.away;
  const { mailbox } = ctx.state;
  const items = [];
  if (s) {
    if (s.freshMarket) items.push('You were gone a long time, so the market has moved on to a fresh state.');
    else if (s.ticks) items.push(`The market updated ${s.ticks} time${s.ticks === 1 ? '' : 's'}.`);
    for (const [id, sale] of Object.entries(s.sold || {})) {
      items.push(el('span', {}, `Sold ${sale.qty} × ${itemById[id].name} for `, coins(sale.copper), '.'));
    }
    for (const [id, qty] of Object.entries(s.expired || {})) {
      items.push(`Listing expired: ${qty} × ${itemById[id].name} came back.`);
    }
    for (const [id, qty] of Object.entries(s.crafted || {})) {
      items.push(`Finished: ${qty} × ${itemById[id].name}.`);
    }
    for (const r of s.returns || []) {
      const haul = r.haul.map((h) => `${h.qty} ${itemById[h.item].name.toLowerCase()}`).join(', ');
      items.push(r.line ? `${r.line} (${haul})` : `${r.name} came back from ${r.zone} with ${haul}.`);
    }
    for (const [id, up] of Object.entries(s.skillUps || {})) {
      items.push(`${professionById[id].name} rose from ${up.from} to ${up.to}.`);
    }
    for (const id of Object.keys(s.skillCapped || {})) {
      items.push(`${professionById[id].name} is at its rank cap. Train the next rank to keep improving.`);
    }
    items.push(...s.lines);
  }
  const waiting = Object.entries(mailbox.items);

  return el('section', { class: 'panel' },
    el('h2', {}, s ? 'While you were away' : 'Ready to collect'),
    s ? el('p', { class: 'dim' }, `You were away ${formatDuration(s.to - s.from)}.`) : null,
    items.length ? el('ul', { class: 'list' }, items.map((line) => el('li', {}, line))) : null,
    mailbox.copper || waiting.length ? el('p', { style: 'margin-top:12px' }, 'To collect: ',
      mailbox.copper ? coins(mailbox.copper) : null,
      waiting.length ? ` ${waiting.map(([id, qty]) => `${qty} × ${itemById[id].name}`).join(', ')}` : null) : null,
    el('div', { class: 'btn-row', style: 'margin-top:12px' },
      el('button', { class: 'btn btn-primary', type: 'button', onclick: () => ctx.collectAll() }, 'Collect all')),
  );
}
