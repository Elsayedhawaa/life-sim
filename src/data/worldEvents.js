/* ============================================================================
   World Life 2.0 — v2.15 Worker 4: Era World Events (data)
   A real table of era-locked world events, each with a real date range and
   a real effect, plus real central-bank policy rates by country and era.

   EVENTS: every entry names the countries it hits and how much. Effects
   are multipliers (1 = no change) except `rate`, which is a shift in
   percentage points as a decimal (e.g. -0.04 = the central bank cut rates
   by 4 points). An event with an `all` block hits every country the same
   way; a `countries` block overrides it per country; a country listed in
   neither is untouched by that event.

   The numbers are the real history, rounded to game scale:
   - 1973 oil shock: OPEC embargo quadrupled oil prices; importers fell
     into recession, exporters boomed.
   - 1979 oil shock: Iranian revolution, oil doubled again; Volcker-era
     rates followed.
   - 1990 Japan bubble: Nikkei peaked Dec 1989, land prices fell for
     years after.
   - 1990 Gulf war: Iraq invaded Kuwait Aug 1990; oil spiked, Gulf
     business and tourism fell.
   - 1992 Sweden banking crisis: property fell ~30-40%, Riksbank briefly
     raised rates to 500% (Sep 1992) to defend the krona.
   - 1997 Asian crisis: Thai baht floated Jul 1997; property and business
     fell across South-East Asia.
   - 2000 dot-com crash: NASDAQ fell ~78% peak to trough 2000-2002.
   - 2001 Sep 11: US air travel and tourism collapsed for months.
   - 2008 financial crisis: US house prices fell ~25-30% peak to trough
     (Case-Shiller), UK ~18%; central banks cut rates to near zero.
   - 2011 euro debt crisis: sovereign debt panic, southern Europe hit.
   - 2011 Egyptian revolution: tourism and investment collapsed in Egypt.
   - 2014 oil crash: Brent fell from ~$115 to ~$30; Gulf budgets cut.
   - 2016 Egypt float: EGP floated Nov 2016, halved against the dollar;
     prices jumped, real pay fell, rates rose to ~19%.
   - 2016 Brexit: sterling fell ~15% after the Jun 2016 vote; UK growth
     slowed.
   - 2020 pandemic: global lockdowns Mar 2020; business revenue collapsed
     while US/UK house prices ROSE on cheap mortgages and remote work.
   - 2021 Turkey lira crisis: lira lost ~45% in 2021 while the central
     bank CUT rates into triple-digit inflation.
   - 2022 Ukraine war: energy prices spiked in Europe; rates rose
     everywhere.
   - 2024 Egypt float: EGP floated again Mar 2024 (30 to ~50 per dollar);
     rates rose to 27%.

   RATES: POLICY_RATE_ANCHORS are central-bank policy rates (annual, as
   decimals) at real anchor years — Fed funds (USA), Bank Rate (UK),
   CBE overnight (Egypt), Bundesbank/ECB (Germany and the euro area),
   Bank of Japan, SAMA repo (Saudi, tracks the Fed), and the rest. The
   system interpolates linearly between anchors; before the first anchor
   the earliest value holds, after the last the latest holds.
   ========================================================================== */

export const WORLD_EVENTS = [
  {
    id: 'oil_shock_1973',
    name: 'The 1973 Oil Shock',
    startYear: 1973, startMonth: 10, endYear: 1974, endMonth: 12,
    headline: 'Oil prices have quadrupled since the embargo began, and petrol queues stretch around the block.',
    whatItMeans: 'Fuel and heating cost far more, businesses earn less, and borrowing gets dearer. Oil-producing countries, meanwhile, are suddenly rich.',
    effects: {
      all: { house: 0.95, business: 0.90, salary: 0.97, rate: 0.02 },
      countries: {
        sau: { house: 1.05, business: 1.15, salary: 1.05, rate: 0 },
        uae: { house: 1.05, business: 1.15, salary: 1.05, rate: 0 },
      },
    },
  },
  {
    id: 'oil_shock_1979',
    name: 'The 1979 Oil Shock',
    startYear: 1979, startMonth: 1, endYear: 1980, endMonth: 12,
    headline: 'The revolution in Iran has doubled oil prices again, and inflation is running hot everywhere.',
    whatItMeans: 'Everything costs more, pay buys less, and interest rates climb as central banks fight inflation. Gulf oil states boom again.',
    effects: {
      all: { house: 0.96, business: 0.92, salary: 0.97, rate: 0.03 },
      countries: {
        sau: { house: 1.04, business: 1.12, salary: 1.04, rate: 0 },
        uae: { house: 1.04, business: 1.12, salary: 1.04, rate: 0 },
      },
    },
  },
  {
    id: 'japan_bubble_1990',
    name: 'Japan’s Bubble Bursts',
    startYear: 1990, startMonth: 1, endYear: 1993, endMonth: 12,
    headline: 'Tokyo land and share prices are collapsing after the great bubble of the 1980s.',
    whatItMeans: 'Japanese house prices fall hard and stay down for years. Businesses earn less and pay rises stall.',
    effects: {
      countries: {
        jpn: { house: 0.80, business: 0.90, salary: 0.95, rate: -0.01 },
      },
    },
  },
  {
    id: 'gulf_war_1990',
    name: 'The Gulf War',
    startYear: 1990, startMonth: 8, endYear: 1991, endMonth: 2,
    headline: 'Iraq has invaded Kuwait and a coalition is massing in the Gulf. Oil has spiked and flights are cancelled.',
    whatItMeans: 'Business in the Gulf stalls and tourism stops; oil importers pay more for fuel. In Egypt, tourists stay away.',
    effects: {
      all: { house: 0.98, business: 0.95, salary: 0.98, rate: 0.01 },
      countries: {
        sau: { house: 0.92, business: 0.85, salary: 0.97, rate: 0 },
        uae: { house: 0.92, business: 0.85, salary: 0.97, rate: 0 },
        egy: { house: 0.95, business: 0.90, salary: 0.97, rate: 0.01 },
      },
    },
  },
  {
    id: 'sweden_banking_1992',
    name: 'Sweden’s Banking Crisis',
    startYear: 1992, startMonth: 9, endYear: 1994, endMonth: 12,
    headline: 'Sweden’s banks are failing and the krona is under attack — the central bank briefly raised rates to 500%.',
    whatItMeans: 'Swedish house prices fall sharply, businesses struggle to borrow, and pay freezes.',
    effects: {
      countries: {
        swe: { house: 0.85, business: 0.88, salary: 0.95, rate: 0.02 },
      },
    },
  },
  {
    id: 'asian_crisis_1997',
    name: 'The Asian Financial Crisis',
    startYear: 1997, startMonth: 7, endYear: 1998, endMonth: 12,
    headline: 'Currencies across Asia are collapsing — Thailand floated the baht and the panic spread to Singapore, Japan and beyond.',
    whatItMeans: 'Property and business fall hardest in Asia, and the shock drags on trade everywhere else.',
    effects: {
      all: { house: 0.99, business: 0.97, salary: 0.99, rate: 0 },
      countries: {
        sgp: { house: 0.85, business: 0.88, salary: 0.93, rate: 0.01 },
        jpn: { house: 0.90, business: 0.90, salary: 0.95, rate: 0 },
        ind: { house: 0.88, business: 0.88, salary: 0.93, rate: 0.02 },
      },
    },
  },
  {
    id: 'dotcom_crash_2000',
    name: 'The Dot-Com Crash',
    startYear: 2000, startMonth: 3, endYear: 2002, endMonth: 10,
    headline: 'The tech bubble has burst — the NASDAQ has lost most of its value and start-ups are folding.',
    whatItMeans: 'Tech and finance businesses earn far less, hiring freezes, and house prices soften in the big tech cities.',
    effects: {
      all: { house: 0.99, business: 0.97, salary: 0.99, rate: -0.01 },
      countries: {
        usa: { house: 0.97, business: 0.90, salary: 0.97, rate: -0.01 },
        deu: { house: 0.97, business: 0.90, salary: 0.97, rate: -0.01 },
        gbr: { house: 0.97, business: 0.90, salary: 0.97, rate: -0.01 },
        fra: { house: 0.97, business: 0.90, salary: 0.97, rate: -0.01 },
        swe: { house: 0.97, business: 0.90, salary: 0.97, rate: -0.01 },
        che: { house: 0.97, business: 0.90, salary: 0.97, rate: -0.01 },
      },
    },
  },
  {
    id: 'sep11_2001',
    name: 'September 11',
    startYear: 2001, startMonth: 9, endYear: 2002, endMonth: 6,
    headline: 'The attacks in New York have grounded flights worldwide and shaken every market.',
    whatItMeans: 'Travel, hotels and restaurants lose months of trade; American businesses take the hardest hit.',
    effects: {
      all: { house: 0.99, business: 0.97, salary: 0.99, rate: -0.01 },
      countries: {
        usa: { house: 0.97, business: 0.92, salary: 0.97, rate: -0.01 },
        egy: { house: 0.98, business: 0.93, salary: 0.98, rate: 0 },
        tur: { house: 0.98, business: 0.93, salary: 0.98, rate: 0 },
      },
    },
  },
  {
    id: 'financial_crisis_2008',
    name: 'The 2008 Financial Crisis',
    startYear: 2008, startMonth: 9, endYear: 2010, endMonth: 6,
    headline: 'Lehman Brothers has collapsed and banks are failing worldwide — house prices are falling fast.',
    whatItMeans: 'House prices fall hardest in America and Britain, businesses earn far less, pay is cut or frozen, and central banks slash interest rates to near zero — so borrowing gets cheap even as jobs get scarce.',
    effects: {
      all: { house: 0.92, business: 0.90, salary: 0.95, rate: -0.03 },
      countries: {
        usa: { house: 0.75, business: 0.85, salary: 0.95, rate: -0.04 },
        gbr: { house: 0.82, business: 0.87, salary: 0.95, rate: -0.04 },
        deu: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        fra: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        ita: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        nld: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        che: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        swe: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        can: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        aus: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.03 },
        egy: { house: 0.92, business: 0.90, salary: 0.95, rate: -0.01 },
        sau: { house: 0.90, business: 0.88, salary: 0.96, rate: -0.02 },
        uae: { house: 0.90, business: 0.88, salary: 0.96, rate: -0.02 },
        jpn: { house: 0.95, business: 0.92, salary: 0.96, rate: -0.01 },
        bra: { house: 0.93, business: 0.92, salary: 0.96, rate: -0.02 },
        ind: { house: 0.93, business: 0.92, salary: 0.96, rate: -0.02 },
        tur: { house: 0.93, business: 0.92, salary: 0.96, rate: -0.02 },
        sgp: { house: 0.90, business: 0.90, salary: 0.96, rate: -0.02 },
      },
    },
  },
  {
    id: 'euro_debt_2011',
    name: 'The Euro Debt Crisis',
    startYear: 2011, startMonth: 1, endYear: 2013, endMonth: 12,
    headline: 'Greece, Italy and Spain are drowning in debt and the euro itself is in doubt.',
    whatItMeans: 'European house prices and business fall, governments cut spending, and pay stalls across the euro area.',
    effects: {
      all: { house: 0.99, business: 0.98, salary: 0.99, rate: -0.01 },
      countries: {
        ita: { house: 0.92, business: 0.92, salary: 0.97, rate: -0.01 },
        fra: { house: 0.92, business: 0.92, salary: 0.97, rate: -0.01 },
        deu: { house: 0.94, business: 0.92, salary: 0.97, rate: -0.01 },
        nld: { house: 0.92, business: 0.92, salary: 0.97, rate: -0.01 },
        gbr: { house: 0.95, business: 0.94, salary: 0.98, rate: -0.01 },
      },
    },
  },
  {
    id: 'egypt_revolution_2011',
    name: 'The Egyptian Revolution',
    startYear: 2011, startMonth: 1, endYear: 2013, endMonth: 12,
    headline: 'Egypt is in revolution — the streets are full, tourists have vanished, and the economy has stalled.',
    whatItMeans: 'In Egypt, tourism and investment collapse, businesses lose a fifth of their trade, house prices fall and pay is cut. Life carries on, but money is tight for years.',
    effects: {
      countries: {
        egy: { house: 0.85, business: 0.80, salary: 0.92, rate: 0.02 },
        sau: { house: 1.0, business: 0.98, salary: 1.0, rate: 0 },
        uae: { house: 1.0, business: 0.98, salary: 1.0, rate: 0 },
      },
    },
  },
  {
    id: 'oil_crash_2014',
    name: 'The 2014 Oil Price Crash',
    startYear: 2014, startMonth: 6, endYear: 2016, endMonth: 12,
    headline: 'Oil has crashed from $115 a barrel to under $30, and Gulf budgets are being cut.',
    whatItMeans: 'In the Gulf, government spending and business fall and pay is squeezed. In countries that import oil, fuel gets cheaper and businesses do a little better.',
    effects: {
      all: { house: 1.01, business: 1.05, salary: 1.02, rate: 0 },
      countries: {
        sau: { house: 0.95, business: 0.88, salary: 0.95, rate: 0 },
        uae: { house: 0.95, business: 0.88, salary: 0.95, rate: 0 },
      },
    },
  },
  {
    id: 'egypt_float_2016',
    name: 'Egypt Floats the Pound (2016)',
    startYear: 2016, startMonth: 11, endYear: 2018, endMonth: 12,
    headline: 'Egypt has floated the pound — it has halved against the dollar overnight and prices are jumping.',
    whatItMeans: 'In Egypt, everything imported costs far more, house prices jump in pounds, real pay buys much less, and the central bank raises rates to about 19% — borrowing gets very expensive.',
    effects: {
      countries: {
        egy: { house: 1.25, business: 0.92, salary: 0.90, rate: 0.06 },
      },
    },
  },
  {
    id: 'brexit_2016',
    name: 'Brexit',
    startYear: 2016, startMonth: 6, endYear: 2020, endMonth: 12,
    headline: 'Britain has voted to leave the European Union and the pound has fallen hard.',
    whatItMeans: 'British house prices soften, businesses face years of uncertainty and new trade friction, and growth slows.',
    effects: {
      countries: {
        gbr: { house: 0.95, business: 0.94, salary: 0.98, rate: -0.01 },
      },
    },
  },
  {
    id: 'covid_2020',
    name: 'The Covid Pandemic',
    startYear: 2020, startMonth: 3, endYear: 2022, endMonth: 6,
    headline: 'A pandemic has shut the world down — streets are empty, shops are closed, and nobody knows how long this lasts.',
    whatItMeans: 'Businesses lose a fifth of their trade and pay is cut or frozen, while central banks slash rates. Oddly, house prices RISE in America and Britain, as cheap mortgages and working from home push people to buy bigger homes.',
    effects: {
      all: { house: 0.95, business: 0.80, salary: 0.95, rate: -0.02 },
      countries: {
        usa: { house: 1.10, business: 0.80, salary: 0.95, rate: -0.02 },
        gbr: { house: 1.10, business: 0.80, salary: 0.95, rate: -0.02 },
        can: { house: 1.10, business: 0.80, salary: 0.95, rate: -0.02 },
        aus: { house: 1.08, business: 0.80, salary: 0.95, rate: -0.02 },
        deu: { house: 1.10, business: 0.80, salary: 0.95, rate: -0.02 },
        egy: { house: 0.95, business: 0.80, salary: 0.95, rate: -0.01 },
        tur: { house: 0.95, business: 0.80, salary: 0.95, rate: -0.01 },
        bra: { house: 0.95, business: 0.80, salary: 0.95, rate: -0.01 },
        ind: { house: 0.95, business: 0.80, salary: 0.95, rate: -0.01 },
      },
    },
  },
  {
    id: 'turkey_lira_2021',
    name: 'Turkey’s Lira Crisis',
    startYear: 2021, startMonth: 9, endYear: 2023, endMonth: 12,
    headline: 'The lira is collapsing while the central bank cuts rates into triple-digit inflation — prices double within months.',
    whatItMeans: 'In Turkey, prices in lira soar, real pay collapses, and businesses struggle to plan anything. Savers watch their money melt.',
    effects: {
      countries: {
        tur: { house: 1.40, business: 0.90, salary: 0.85, rate: -0.05 },
      },
    },
  },
  {
    id: 'ukraine_war_2022',
    name: 'The War in Ukraine',
    startYear: 2022, startMonth: 2, endYear: 2024, endMonth: 12,
    headline: 'War in Ukraine has sent energy and food prices soaring across Europe.',
    whatItMeans: 'European businesses pay far more for energy, house prices soften, and central banks raise rates to fight inflation.',
    effects: {
      all: { house: 0.98, business: 0.97, salary: 0.98, rate: 0.02 },
      countries: {
        deu: { house: 0.95, business: 0.92, salary: 0.97, rate: 0.02 },
        fra: { house: 0.95, business: 0.92, salary: 0.97, rate: 0.02 },
        ita: { house: 0.95, business: 0.92, salary: 0.97, rate: 0.02 },
        nld: { house: 0.95, business: 0.92, salary: 0.97, rate: 0.02 },
        tur: { house: 0.97, business: 0.95, salary: 0.97, rate: 0.01 },
      },
    },
  },
  {
    id: 'egypt_float_2024',
    name: 'Egypt Floats the Pound Again (2024)',
    startYear: 2024, startMonth: 3, endYear: 2025, endMonth: 12,
    headline: 'Egypt has floated the pound again — it has fallen from 30 to about 50 to the dollar, and rates have jumped to 27%.',
    whatItMeans: 'In Egypt, prices jump again, house prices rise in pounds while real pay falls, and borrowing at 27% is ruinously expensive. Cash in the bank finally pays real interest, though.',
    effects: {
      countries: {
        egy: { house: 1.30, business: 0.90, salary: 0.88, rate: 0.08 },
      },
    },
  },
];

/* Central-bank policy rates by country: [year, annual rate as a decimal].
   Real anchors: US Fed funds peaked near 19-20% in 1981 and sat near zero
   2009-2015 and 2020-2021; UK Bank Rate hit 17% in 1980 and 15% in 1990;
   Egypt's CBE rate ran ~20% in the early 1990s, ~19% after the 2016 float
   and 27% after the 2024 float; the Bundesbank/ECB ran ~9% in 1980 and
   0% in 2020-2022; Japan has been near zero since 2000; Turkey's rate
   was ~40% in 2000, cut to ~19% in 2021 while inflation topped 80%, then
   raised past 40% in 2023. */
export const POLICY_RATE_ANCHORS = {
  usa: [[1960, 0.04], [1973, 0.10], [1980, 0.18], [1981, 0.19], [1990, 0.08], [2000, 0.065], [2007, 0.0525], [2009, 0.0025], [2015, 0.005], [2019, 0.0175], [2020, 0.0025], [2023, 0.055], [2025, 0.045]],
  gbr: [[1960, 0.05], [1973, 0.11], [1980, 0.17], [1990, 0.15], [2000, 0.06], [2007, 0.0575], [2009, 0.005], [2020, 0.001], [2023, 0.0525], [2025, 0.045]],
  egy: [[1960, 0.08], [1990, 0.20], [2000, 0.12], [2008, 0.11], [2016, 0.15], [2017, 0.19], [2020, 0.09], [2023, 0.20], [2024, 0.27], [2025, 0.24]],
  deu: [[1960, 0.05], [1980, 0.09], [1990, 0.085], [2000, 0.0475], [2009, 0.01], [2020, 0.0], [2023, 0.045], [2025, 0.03]],
  fra: [[1960, 0.05], [1980, 0.10], [1990, 0.09], [2000, 0.0475], [2009, 0.01], [2020, 0.0], [2023, 0.045], [2025, 0.03]],
  ita: [[1960, 0.05], [1980, 0.15], [1990, 0.12], [2000, 0.0475], [2009, 0.01], [2020, 0.0], [2023, 0.045], [2025, 0.03]],
  nld: [[1960, 0.05], [1980, 0.09], [1990, 0.085], [2000, 0.0475], [2009, 0.01], [2020, 0.0], [2023, 0.045], [2025, 0.03]],
  can: [[1960, 0.04], [1980, 0.18], [1990, 0.13], [2000, 0.06], [2009, 0.0025], [2020, 0.0025], [2023, 0.05], [2025, 0.03]],
  aus: [[1960, 0.04], [1990, 0.15], [2000, 0.06], [2009, 0.03], [2020, 0.001], [2023, 0.0435], [2025, 0.04]],
  jpn: [[1960, 0.06], [1990, 0.06], [2000, 0.005], [2010, 0.001], [2020, -0.001], [2023, -0.001], [2025, 0.005]],
  sau: [[1960, 0.04], [2000, 0.06], [2009, 0.005], [2020, 0.01], [2023, 0.06], [2025, 0.05]],
  uae: [[1960, 0.04], [2000, 0.06], [2009, 0.005], [2020, 0.01], [2023, 0.06], [2025, 0.05]],
  che: [[1960, 0.04], [1990, 0.07], [2000, 0.035], [2009, 0.0025], [2020, -0.0075], [2023, 0.0175], [2025, 0.005]],
  swe: [[1960, 0.05], [1990, 0.10], [1992, 0.10], [2000, 0.04], [2009, 0.0025], [2020, 0.0], [2023, 0.04], [2025, 0.025]],
  tur: [[1960, 0.10], [2000, 0.40], [2010, 0.07], [2018, 0.24], [2021, 0.19], [2023, 0.42], [2025, 0.40]],
  bra: [[1960, 0.10], [2000, 0.17], [2010, 0.11], [2020, 0.02], [2023, 0.13], [2025, 0.13]],
  ind: [[1960, 0.06], [2000, 0.08], [2010, 0.065], [2020, 0.04], [2023, 0.065], [2025, 0.06]],
  sgp: [[1960, 0.03], [2000, 0.025], [2009, 0.001], [2020, 0.001], [2023, 0.04], [2025, 0.03]],
};
