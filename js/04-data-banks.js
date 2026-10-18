/* ============================================================
   WORLD LIFE — DATA: BANKING & FINANCIAL SYSTEM (Expanded)
   ============================================================
   All prices/amounts in each country's own currency.
   Pure data module for banking institutions, certificates of deposit,
   credit cards, and loan products.
   ============================================================ */

/* ============================================================
   1. FINANCIAL INSTITUTIONS
   ============================================================ */
const BANKS = {
  egy: [
    { id: 'cib', name: 'Commercial International Bank', shortName: 'CIB', founded: 1975, reputation: 5, savingsRate: 0.025, type: 'commercial' },
    { id: 'nbe', name: 'National Bank of Egypt', shortName: 'NBE', founded: 1898, reputation: 4, savingsRate: 0.030, type: 'state' },
    { id: 'banque_misr', name: 'Banque Misr', shortName: 'BM', founded: 1920, reputation: 4, savingsRate: 0.030, type: 'state' },
    { id: 'qnb', name: 'QNB Alahli', shortName: 'QNB', founded: 1978, reputation: 4, savingsRate: 0.022, type: 'commercial' },
    { id: 'hsbc_egy', name: 'HSBC Egypt', shortName: 'HSBC', founded: 1982, reputation: 5, savingsRate: 0.010, type: 'international' },
    { id: 'emirates_nbd_egy', name: 'Emirates NBD Egypt', shortName: 'ENBD', founded: 2005, reputation: 4, savingsRate: 0.020, type: 'commercial' },
    { id: 'banque_du_caire', name: 'Banque du Caire', shortName: 'BdC', founded: 1952, reputation: 4, savingsRate: 0.028, type: 'state' },
    { id: 'fab_misr', name: 'FABMISR', shortName: 'FABMISR', founded: 2022, reputation: 4, savingsRate: 0.022, type: 'commercial' },
    { id: 'alexbank', name: 'Alexbank (Intesa Sanpaolo)', shortName: 'AlexBank', founded: 1957, reputation: 4, savingsRate: 0.020, type: 'commercial' },
    { id: 'aaib', name: 'Arab African International Bank', shortName: 'AAIB', founded: 1964, reputation: 5, savingsRate: 0.025, type: 'commercial' },
    { id: 'adib_egy', name: 'Abu Dhabi Islamic Bank Egypt', shortName: 'ADIB', founded: 2007, reputation: 4, savingsRate: 0.024, type: 'islamic' },
    { id: 'credit_agricole', name: 'Crédit Agricole Egypt', shortName: 'CAE', founded: 2006, reputation: 4, savingsRate: 0.018, type: 'international' },
    { id: 'telda', name: 'Telda FinTech', shortName: 'Telda', founded: 2021, reputation: 3, savingsRate: 0.000, type: 'neobank' }
  ],
  usa: [
    { id: 'chase', name: 'JPMorgan Chase Bank', shortName: 'Chase', founded: 1799, reputation: 5, savingsRate: 0.0001, type: 'commercial' },
    { id: 'bofa', name: 'Bank of America', shortName: 'BofA', founded: 1784, reputation: 5, savingsRate: 0.0001, type: 'commercial' },
    { id: 'wells', name: 'Wells Fargo Bank', shortName: 'Wells', founded: 1852, reputation: 4, savingsRate: 0.0001, type: 'commercial' },
    { id: 'citi', name: 'Citibank', shortName: 'Citi', founded: 1812, reputation: 4, savingsRate: 0.0005, type: 'commercial' },
    { id: 'ally', name: 'Ally Bank', shortName: 'Ally', founded: 1919, reputation: 5, savingsRate: 0.0425, type: 'neobank' },
    { id: 'capital_one', name: 'Capital One', shortName: 'CapOne', founded: 1994, reputation: 4, savingsRate: 0.0415, type: 'commercial' },
    { id: 'marcus', name: 'Marcus by Goldman Sachs', shortName: 'Marcus', founded: 2016, reputation: 5, savingsRate: 0.0440, type: 'neobank' },
    { id: 'schwab', name: 'Charles Schwab Bank', shortName: 'Schwab', founded: 1971, reputation: 5, savingsRate: 0.0045, type: 'wealth' },
    { id: 'fidelity', name: 'Fidelity Cash Management', shortName: 'Fidelity', founded: 1946, reputation: 5, savingsRate: 0.0480, type: 'wealth' }
  ],
  sau: [
    { id: 'snb', name: 'Saudi National Bank', shortName: 'SNB', founded: 1953, reputation: 5, savingsRate: 0.015, type: 'state' },
    { id: 'al_rajhi', name: 'Al Rajhi Bank', shortName: 'Al Rajhi', founded: 1957, reputation: 5, savingsRate: 0.020, type: 'islamic' },
    { id: 'riyad', name: 'Riyad Bank', shortName: 'Riyad', founded: 1957, reputation: 4, savingsRate: 0.018, type: 'commercial' },
    { id: 'sabb', name: 'Saudi Awwal Bank', shortName: 'SAB', founded: 1978, reputation: 5, savingsRate: 0.016, type: 'commercial' },
    { id: 'alinma', name: 'Alinma Bank', shortName: 'Alinma', founded: 2006, reputation: 5, savingsRate: 0.022, type: 'islamic' },
    { id: 'aljazira', name: 'Bank AlJazira', shortName: 'AlJazira', founded: 1975, reputation: 4, savingsRate: 0.018, type: 'islamic' },
    { id: 'stc_bank', name: 'STC Bank', shortName: 'STC Bank', founded: 2020, reputation: 4, savingsRate: 0.025, type: 'neobank' }
  ],
  uae: [
    { id: 'emirates_nbd', name: 'Emirates NBD', shortName: 'ENBD', founded: 1963, reputation: 5, savingsRate: 0.015, type: 'commercial' },
    { id: 'fab', name: 'First Abu Dhabi Bank', shortName: 'FAB', founded: 2017, reputation: 5, savingsRate: 0.018, type: 'commercial' },
    { id: 'adcb', name: 'Abu Dhabi Commercial Bank', shortName: 'ADCB', founded: 1985, reputation: 4, savingsRate: 0.014, type: 'commercial' },
    { id: 'dib', name: 'Dubai Islamic Bank', shortName: 'DIB', founded: 1975, reputation: 5, savingsRate: 0.022, type: 'islamic' },
    { id: 'mashreq', name: 'Mashreq Bank', shortName: 'Mashreq', founded: 1967, reputation: 4, savingsRate: 0.020, type: 'commercial' },
    { id: 'wio', name: 'Wio Bank', shortName: 'Wio', founded: 2022, reputation: 4, savingsRate: 0.050, type: 'neobank' }
  ],
  uk: [
    { id: 'hsbc_uk', name: 'HSBC UK', shortName: 'HSBC', founded: 1865, reputation: 5, savingsRate: 0.020, type: 'commercial' },
    { id: 'barclays', name: 'Barclays Bank', shortName: 'Barclays', founded: 1690, reputation: 5, savingsRate: 0.015, type: 'commercial' },
    { id: 'lloyds', name: 'Lloyds Bank', shortName: 'Lloyds', founded: 1765, reputation: 4, savingsRate: 0.014, type: 'commercial' },
    { id: 'natwest', name: 'NatWest', shortName: 'NatWest', founded: 1968, reputation: 4, savingsRate: 0.018, type: 'commercial' },
    { id: 'monzo', name: 'Monzo Bank', shortName: 'Monzo', founded: 2015, reputation: 5, savingsRate: 0.041, type: 'neobank' },
    { id: 'starling', name: 'Starling Bank', shortName: 'Starling', founded: 2014, reputation: 5, savingsRate: 0.032, type: 'neobank' }
  ]
};

/* ============================================================
   2. CERTIFICATES OF DEPOSIT & FIXED SAVINGS
   ============================================================ */
const CERTIFICATES = {
  egy: [
    { id: 'nbe_platinum_monthly', bankId: 'nbe', name: 'NBE Platinum 3-Year (Monthly)', term: 3, minAmount: 1000, rates: [0.215, 0.215, 0.215], payout: 'monthly', earlyPenalty: 0.095 },
    { id: 'nbe_platinum_yearly', bankId: 'nbe', name: 'NBE Platinum 1-Year High-Yield', term: 1, minAmount: 1000, rates: [0.270], payout: 'at_maturity', earlyPenalty: 0.080 },
    { id: 'bm_alqimma', bankId: 'banque_misr', name: 'Al Qimma Certificate', term: 3, minAmount: 1000, rates: [0.215, 0.215, 0.215], payout: 'monthly', earlyPenalty: 0.095 },
    { id: 'bm_ibnmisr', bankId: 'banque_misr', name: 'Ibn Misr (Descending Yield)', term: 3, minAmount: 1000, rates: [0.300, 0.250, 0.200], payout: 'annually', earlyPenalty: 0.100 },
    { id: 'cib_premium', bankId: 'cib', name: 'CIB Premium 3-Year CD', term: 3, minAmount: 1000000, rates: [0.220, 0.220, 0.220], payout: 'monthly', earlyPenalty: 0.090 },
    { id: 'cib_prime', bankId: 'cib', name: 'CIB Prime 3-Year CD', term: 3, minAmount: 100000, rates: [0.200, 0.200, 0.200], payout: 'monthly', earlyPenalty: 0.085 },
    { id: 'alexbank_cdmax', bankId: 'alexbank', name: 'CD MAX High-Yield', term: 3, minAmount: 500000, rates: [0.210, 0.210, 0.210], payout: 'monthly', earlyPenalty: 0.090 },
    { id: 'aaib_golden', bankId: 'aaib', name: 'AAIB Golden Certificate', term: 3, minAmount: 50000, rates: [0.225, 0.225, 0.225], payout: 'quarterly', earlyPenalty: 0.092 },
    { id: 'adib_murabaha', bankId: 'adib_egy', name: 'ADIB Murabaha Deposit Certificate', term: 3, minAmount: 10000, rates: [0.210, 0.210, 0.210], payout: 'monthly', earlyPenalty: 0.080 },
    { id: 'nbe_usd_al_ahly', bankId: 'nbe', name: 'NBE Al-Ahly USD Certificate', term: 3, minAmount: 1000, rates: [0.070, 0.070, 0.070], payout: 'quarterly', earlyPenalty: 0.030 }
  ],
  usa: [
    { id: 'ally_1yr', bankId: 'ally', name: 'Ally High Yield 12-Month CD', term: 1, minAmount: 0, rates: [0.0450], payout: 'at_maturity', earlyPenalty: 0.007 },
    { id: 'ally_3yr', bankId: 'ally', name: 'Ally 3-Year Fixed CD', term: 3, minAmount: 0, rates: [0.0420, 0.0420, 0.0420], payout: 'at_maturity', earlyPenalty: 0.012 },
    { id: 'marcus_1yr', bankId: 'marcus', name: 'Marcus 1-Year High Yield CD', term: 1, minAmount: 500, rates: [0.0470], payout: 'at_maturity', earlyPenalty: 0.008 },
    { id: 'chase_1yr', bankId: 'chase', name: 'Chase Standard 12-Month CD', term: 1, minAmount: 1000, rates: [0.0300], payout: 'at_maturity', earlyPenalty: 0.010 },
    { id: 'capone_1yr', bankId: 'capital_one', name: 'Capital One 360 12-Month CD', term: 1, minAmount: 0, rates: [0.0460], payout: 'at_maturity', earlyPenalty: 0.008 },
    { id: 'fidelity_cd_ladder', bankId: 'fidelity', name: 'Fidelity Brokered 2-Year CD', term: 2, minAmount: 1000, rates: [0.0480, 0.0480], payout: 'semi_annually', earlyPenalty: 0.015 }
  ],
  sau: [
    { id: 'snb_murabaha_1yr', bankId: 'snb', name: 'SNB Al-Ahal Murabaha Deposit', term: 1, minAmount: 20000, rates: [0.0520], payout: 'at_maturity', earlyPenalty: 0.008 },
    { id: 'rajhi_al_mukhtart', bankId: 'al_rajhi', name: 'Al Rajhi Al-Mukhtar Savings CD', term: 1, minAmount: 10000, rates: [0.0510], payout: 'monthly', earlyPenalty: 0.007 },
    { id: 'riyad_al_yusr_3yr', bankId: 'riyad', name: 'Riyad Bank Al-Yusr 3-Year Deposit', term: 3, minAmount: 50000, rates: [0.0480, 0.0480, 0.0480], payout: 'quarterly', earlyPenalty: 0.010 },
    { id: 'alinma_murabaha', bankId: 'alinma', name: 'Alinma Investment Murabaha CD', term: 1, minAmount: 25000, rates: [0.0535], payout: 'at_maturity', earlyPenalty: 0.009 }
  ],
  uae: [
    { id: 'enbd_1yr_fixed', bankId: 'emirates_nbd', name: 'Emirates NBD 12-Month Fixed Deposit', term: 1, minAmount: 10000, rates: [0.0475], payout: 'at_maturity', earlyPenalty: 0.010 },
    { id: 'fab_high_yield', bankId: 'fab', name: 'FAB High-Yield 1-Year Deposit', term: 1, minAmount: 25000, rates: [0.0510], payout: 'quarterly', earlyPenalty: 0.012 },
    { id: 'adcb_millionaire', bankId: 'adcb', name: 'ADCB Millionaire Savings Certificate', term: 1, minAmount: 5000, rates: [0.0350], payout: 'at_maturity', earlyPenalty: 0.005 },
    { id: 'wio_space_cd', bankId: 'wio', name: 'Wio Save Space 12-Month CD', term: 1, minAmount: 1000, rates: [0.0525], payout: 'monthly', earlyPenalty: 0.005 }
  ],
  uk: [
    { id: 'hsbc_1yr_fixed', bankId: 'hsbc_uk', name: 'HSBC Fixed Rate Saver 1-Year', term: 1, minAmount: 2000, rates: [0.0460], payout: 'at_maturity', earlyPenalty: 0.010 },
    { id: 'barclays_1yr_bond', bankId: 'barclays', name: 'Barclays 1-Year Fixed Rate Bond', term: 1, minAmount: 500, rates: [0.0450], payout: 'at_maturity', earlyPenalty: 0.010 },
    { id: 'monzo_growth_pot', bankId: 'monzo', name: 'Monzo Fixed Savings Pot 12-Mo', term: 1, minAmount: 500, rates: [0.0480], payout: 'at_maturity', earlyPenalty: 0.005 },
    { id: 'starling_fixed_saver', bankId: 'starling', name: 'Starling 1-Year Fixed Saver', term: 1, minAmount: 2000, rates: [0.0470], payout: 'at_maturity', earlyPenalty: 0.005 }
  ]
};

/* ============================================================
   3. CREDIT CARDS & REWARDS
   ============================================================ */
const CREDIT_CARDS = {
  egy: [
    { id: 'cib_classic', bankId: 'cib', name: 'CIB Classic Credit Card', tier: 'classic', minLimit: 15000, maxLimit: 80000, apr: 0.38, minPaymentPct: 0.05, cashbackRate: 0.010, reqScore: 580, reqIncome: 96000, perks: ['1% Bonus points cashback', '0% Installment plans at major merchants', 'Free SMS notifications'] },
    { id: 'cib_titanium', bankId: 'cib', name: 'CIB Titanium Mastercard', tier: 'gold', minLimit: 80000, maxLimit: 250000, apr: 0.36, minPaymentPct: 0.05, cashbackRate: 0.018, reqScore: 650, reqIncome: 240000, perks: ['1.8% cashback', 'Airport lounge access across MENA', 'Buy-1-Get-1 dining offers'] },
    { id: 'cib_wealth', bankId: 'cib', name: 'CIB Wealth Visa Infinite', tier: 'infinite', minLimit: 400000, maxLimit: 2000000, apr: 0.32, minPaymentPct: 0.05, cashbackRate: 0.035, reqScore: 750, reqIncome: 800000, perks: ['3.5% cashback', 'Unlimited worldwide lounge key access', 'Personal Concierge 24/7', 'Full travel insurance'] },
    { id: 'nbe_classic', bankId: 'nbe', name: 'NBE Classic Mastercard', tier: 'classic', minLimit: 10000, maxLimit: 50000, apr: 0.35, minPaymentPct: 0.05, cashbackRate: 0.010, reqScore: 560, reqIncome: 72000, perks: ['Al Ahly points program', '55-day grace period'] },
    { id: 'nbe_platinum', bankId: 'nbe', name: 'NBE Platinum Visa', tier: 'platinum', minLimit: 100000, maxLimit: 500000, apr: 0.33, minPaymentPct: 0.05, cashbackRate: 0.022, reqScore: 680, reqIncome: 360000, perks: ['2.2% cashback', 'Lounge access at 25 airports', 'Purchase protection insurance'] },
    { id: 'nbe_world_elite', bankId: 'nbe', name: 'NBE World Elite Mastercard', tier: 'infinite', minLimit: 500000, maxLimit: 3000000, apr: 0.30, minPaymentPct: 0.05, cashbackRate: 0.040, reqScore: 780, reqIncome: 1200000, perks: ['4.0% cashback', 'Global VIP airport access', 'Free valet parking', 'Comprehensive medical emergency cover'] },
    { id: 'bm_titanium', bankId: 'banque_misr', name: 'Banque Misr Titanium Card', tier: 'gold', minLimit: 30000, maxLimit: 150000, apr: 0.36, minPaymentPct: 0.05, cashbackRate: 0.015, reqScore: 620, reqIncome: 140000, perks: ['BM Rewards point multiplier', '12-month 0% interest promo'] },
    { id: 'hsbc_premier', bankId: 'hsbc_egy', name: 'HSBC Premier Mastercard', tier: 'platinum', minLimit: 200000, maxLimit: 1200000, apr: 0.31, minPaymentPct: 0.05, cashbackRate: 0.025, reqScore: 720, reqIncome: 600000, perks: ['2.5% rewards value', 'Global HSBC Premier status sharing', 'No FX markup on overseas travel'] },
    { id: 'adib_covered_gold', bankId: 'adib_egy', name: 'ADIB Covered Gold Card (Sharia)', tier: 'gold', minLimit: 25000, maxLimit: 120000, apr: 0.34, minPaymentPct: 0.05, cashbackRate: 0.015, reqScore: 610, reqIncome: 120000, perks: ['Fully Sharia compliant Murabaha structure', 'ADIB Smiles rewards'] }
  ],
  usa: [
    { id: 'chase_freedom', bankId: 'chase', name: 'Chase Freedom Unlimited', tier: 'classic', minLimit: 3000, maxLimit: 25000, apr: 0.22, minPaymentPct: 0.02, cashbackRate: 0.015, reqScore: 670, reqIncome: 35000, perks: ['1.5% unlimited cash back', '3% on dining & drugstores', '0% intro APR for 15 months'] },
    { id: 'chase_sapphire', bankId: 'chase', name: 'Chase Sapphire Reserve', tier: 'infinite', minLimit: 10000, maxLimit: 75000, apr: 0.23, minPaymentPct: 0.02, cashbackRate: 0.035, reqScore: 750, reqIncome: 90000, perks: ['$300 Annual Travel Credit', '3x on Travel & Dining', 'Priority Pass Select Lounge Access', 'Global Entry fee credit'] },
    { id: 'amex_gold', bankId: 'chase', name: 'American Express Gold Card', tier: 'gold', minLimit: 5000, maxLimit: 50000, apr: 0.24, minPaymentPct: 0.02, cashbackRate: 0.025, reqScore: 700, reqIncome: 60000, perks: ['4x at Restaurants & US Supermarkets', '$120 Uber Cash annually', '$120 Dining credit'] },
    { id: 'capital_venture_x', bankId: 'capital_one', name: 'Capital One Venture X', tier: 'infinite', minLimit: 10000, maxLimit: 60000, apr: 0.21, minPaymentPct: 0.02, cashbackRate: 0.030, reqScore: 740, reqIncome: 85000, perks: ['10x on Hotels & Rental cars', '$300 Annual Capital One Travel credit', 'Capital One & Plaza Premium lounge access'] },
    { id: 'citi_double', bankId: 'citi', name: 'Citi Double Cash Card', tier: 'classic', minLimit: 2000, maxLimit: 20000, apr: 0.20, minPaymentPct: 0.02, cashbackRate: 0.020, reqScore: 660, reqIncome: 30000, perks: ['2% flat cash back (1% when you buy, 1% when you pay)'] },
    { id: 'discover_it', bankId: 'ally', name: 'Discover it Cash Back', tier: 'classic', minLimit: 1500, maxLimit: 15000, apr: 0.19, minPaymentPct: 0.02, cashbackRate: 0.025, reqScore: 650, reqIncome: 25000, perks: ['5% rotating quarterly categories', 'First year cashback match double bonus'] }
  ],
  sau: [
    { id: 'snb_alfursan', bankId: 'snb', name: 'SNB AlFursan Visa Infinite', tier: 'infinite', minLimit: 50000, maxLimit: 300000, apr: 0.22, minPaymentPct: 0.05, cashbackRate: 0.030, reqScore: 740, reqIncome: 240000, perks: ['1 AlFursan Air Mile per 3 SAR spent', 'Unlimited airport lounges', 'Free green fee at golf courses'] },
    { id: 'rajhi_cashback_plus', bankId: 'al_rajhi', name: 'Al Rajhi Cashback Plus Signature', tier: 'platinum', minLimit: 20000, maxLimit: 150000, apr: 0.24, minPaymentPct: 0.05, cashbackRate: 0.025, reqScore: 680, reqIncome: 140000, perks: ['2.5% cashback on international spend', 'Sharia compliant Murabaha structure', 'DragonPass lounge access'] },
    { id: 'riyad_infinite', bankId: 'riyad', name: 'Riyad Bank Visa Infinite', tier: 'infinite', minLimit: 60000, maxLimit: 400000, apr: 0.20, minPaymentPct: 0.05, cashbackRate: 0.032, reqScore: 760, reqIncome: 300000, perks: ['Multi-currency wallet zero FX', 'Concierge desk', 'Full family medical travel coverage'] }
  ],
  uae: [
    { id: 'enbd_skywards', bankId: 'emirates_nbd', name: 'Emirates NBD Skywards Infinite', tier: 'infinite', minLimit: 40000, maxLimit: 350000, apr: 0.27, minPaymentPct: 0.05, cashbackRate: 0.035, reqScore: 730, reqIncome: 300000, perks: ['Up to 2 Skywards Miles per USD spent', 'Emirates Silver Tier Status', 'Unlimited Golf access in UAE'] },
    { id: 'fab_cashback_infinite', bankId: 'fab', name: 'FAB Cashback Visa Infinite', tier: 'infinite', minLimit: 30000, maxLimit: 250000, apr: 0.26, minPaymentPct: 0.05, cashbackRate: 0.050, reqScore: 720, reqIncome: 240000, perks: ['5% cash back on Supermarkets, Fuel, and Utilities', 'VIP airport transfers'] },
    { id: 'adcb_touchpoints', bankId: 'adcb', name: 'ADCB TouchPoints Titanium', tier: 'gold', minLimit: 10000, maxLimit: 80000, apr: 0.29, minPaymentPct: 0.05, cashbackRate: 0.015, reqScore: 640, reqIncome: 96000, perks: ['TouchPoints reward catalog', '2-for-1 Vox Cinema tickets'] }
  ],
  uk: [
    { id: 'barclaycard_avios', bankId: 'barclays', name: 'Barclaycard Avios Plus', tier: 'platinum', minLimit: 3000, maxLimit: 25000, apr: 0.23, minPaymentPct: 0.02, cashbackRate: 0.020, reqScore: 720, reqIncome: 35000, perks: ['1.5 British Airways Avios per £1', 'Cabin Upgrade Voucher yearly'] },
    { id: 'hsbc_premier_uk', bankId: 'hsbc_uk', name: 'HSBC Premier World Elite Card', tier: 'infinite', minLimit: 8000, maxLimit: 50000, apr: 0.21, minPaymentPct: 0.02, cashbackRate: 0.025, reqScore: 760, reqIncome: 75000, perks: ['LoungeKey airport pass', '2 Reward points per £1', 'No foreign transaction fees'] },
    { id: 'monzo_flex', bankId: 'monzo', name: 'Monzo Flex Credit Line', tier: 'classic', minLimit: 500, maxLimit: 6000, apr: 0.22, minPaymentPct: 0.03, cashbackRate: 0.010, reqScore: 630, reqIncome: 18000, perks: ['Split any purchase into 3 monthly interest-free payments'] }
  ]
};

/* ============================================================
   4. LOAN PRODUCTS & MORTGAGES
   ============================================================ */
const LOAN_PRODUCTS = {
  egy: [
    { id: 'personal_cash', name: 'Unsecured Personal Cash Finance', purpose: 'general', minAmount: 20000, maxAmount: 1500000, rate: 0.250, minTerm: 1, maxTerm: 8, reqScore: 600, reqIncome: 8000, requiresProperty: false, requiresCar: false },
    { id: 'cbe_mortgage_subsidized', name: 'CBE Low/Middle Income Mortgage Initiative', purpose: 'mortgage', minAmount: 100000, maxAmount: 2500000, rate: 0.080, minTerm: 10, maxTerm: 30, reqScore: 620, reqIncome: 10000, requiresProperty: true, requiresCar: false },
    { id: 'commercial_mortgage', name: 'Commercial Real Estate Mortgage', purpose: 'mortgage', minAmount: 500000, maxAmount: 15000000, rate: 0.230, minTerm: 5, maxTerm: 15, reqScore: 680, reqIncome: 35000, requiresProperty: true, requiresCar: false },
    { id: 'auto_loan_standard', name: 'Auto Finance (New Car)', purpose: 'car', minAmount: 100000, maxAmount: 3000000, rate: 0.220, minTerm: 1, maxTerm: 7, reqScore: 610, reqIncome: 12000, requiresProperty: false, requiresCar: true },
    { id: 'sme_business_loan', name: 'SME Commercial Expansion Loan', purpose: 'business', minAmount: 250000, maxAmount: 10000000, rate: 0.050, minTerm: 2, maxTerm: 5, reqScore: 700, reqIncome: 50000, requiresProperty: false, requiresCar: false },
    { id: 'doctor_clinic_loan', name: 'Medical Clinic & Equipment Finance', purpose: 'business', minAmount: 100000, maxAmount: 4000000, rate: 0.180, minTerm: 2, maxTerm: 6, reqScore: 650, reqIncome: 20000, requiresProperty: false, requiresCar: false }
  ],
  usa: [
    { id: 'personal_unsecured', name: 'Unsecured Personal Loan', purpose: 'general', minAmount: 2000, maxAmount: 50000, rate: 0.105, minTerm: 2, maxTerm: 7, reqScore: 650, reqIncome: 30000, requiresProperty: false, requiresCar: false },
    { id: 'fixed_30yr_mortgage', name: '30-Year Fixed Conventional Mortgage', purpose: 'mortgage', minAmount: 100000, maxAmount: 750000, rate: 0.066, minTerm: 30, maxTerm: 30, reqScore: 680, reqIncome: 50000, requiresProperty: true, requiresCar: false },
    { id: 'jumbo_mortgage', name: 'Jumbo Luxury Home Mortgage', purpose: 'mortgage', minAmount: 750001, maxAmount: 5000000, rate: 0.071, minTerm: 15, maxTerm: 30, reqScore: 740, reqIncome: 180000, requiresProperty: true, requiresCar: false },
    { id: 'auto_loan_new', name: 'New Vehicle Purchase Loan', purpose: 'car', minAmount: 10000, maxAmount: 120000, rate: 0.059, minTerm: 3, maxTerm: 6, reqScore: 660, reqIncome: 32000, requiresProperty: false, requiresCar: true },
    { id: 'sba_7a_loan', name: 'SBA 7(a) Small Business Finance', purpose: 'business', minAmount: 50000, maxAmount: 2000000, rate: 0.095, minTerm: 5, maxTerm: 10, reqScore: 700, reqIncome: 75000, requiresProperty: false, requiresCar: false },
    { id: 'federal_student_loan', name: 'Direct Subsidized Student Loan', purpose: 'student', minAmount: 2500, maxAmount: 60000, rate: 0.055, minTerm: 10, maxTerm: 20, reqScore: 550, reqIncome: 0, requiresProperty: false, requiresCar: false }
  ],
  sau: [
    { id: 'personal_tawarruq', name: 'Personal Finance (Tawarruq Sharia)', purpose: 'general', minAmount: 20000, maxAmount: 500000, rate: 0.045, minTerm: 1, maxTerm: 5, reqScore: 640, reqIncome: 6000, requiresProperty: false, requiresCar: false },
    { id: 'redf_subsidized_housing', name: 'REDF Subsidized Housing Murabaha', purpose: 'mortgage', minAmount: 200000, maxAmount: 3000000, rate: 0.032, minTerm: 15, maxTerm: 25, reqScore: 660, reqIncome: 10000, requiresProperty: true, requiresCar: false },
    { id: 'auto_murabaha', name: 'Auto Murabaha Lease-to-Own', purpose: 'car', minAmount: 30000, maxAmount: 400000, rate: 0.048, minTerm: 2, maxTerm: 5, reqScore: 630, reqIncome: 7000, requiresProperty: false, requiresCar: true },
    { id: 'monshaat_sme', name: 'Monsha’at SME Development Finance', purpose: 'business', minAmount: 100000, maxAmount: 5000000, rate: 0.040, minTerm: 3, maxTerm: 7, reqScore: 690, reqIncome: 30000, requiresProperty: false, requiresCar: false }
  ],
  uae: [
    { id: 'personal_expat', name: 'Expat Personal Salary Transfer Loan', purpose: 'general', minAmount: 15000, maxAmount: 400000, rate: 0.058, minTerm: 1, maxTerm: 4, reqScore: 650, reqIncome: 10000, requiresProperty: false, requiresCar: false },
    { id: 'home_finance_expat', name: 'Residential Home Mortgage Finance', purpose: 'mortgage', minAmount: 250000, maxAmount: 10000000, rate: 0.045, minTerm: 10, maxTerm: 25, reqScore: 680, reqIncome: 20000, requiresProperty: true, requiresCar: false },
    { id: 'auto_loan_uae', name: 'Comprehensive Auto Finance', purpose: 'car', minAmount: 25000, maxAmount: 600000, rate: 0.042, minTerm: 2, maxTerm: 5, reqScore: 640, reqIncome: 10000, requiresProperty: false, requiresCar: true }
  ],
  uk: [
    { id: 'unsecured_personal_uk', name: 'Fixed Rate Personal Loan', purpose: 'general', minAmount: 2000, maxAmount: 35000, rate: 0.068, minTerm: 1, maxTerm: 7, reqScore: 660, reqIncome: 18000, requiresProperty: false, requiresCar: false },
    { id: 'residential_mortgage_uk', name: '5-Year Fixed Rate Residential Mortgage', purpose: 'mortgage', minAmount: 50000, maxAmount: 1000000, rate: 0.047, minTerm: 15, maxTerm: 35, reqScore: 680, reqIncome: 30000, requiresProperty: true, requiresCar: false },
    { id: 'pcp_car_finance', name: 'Personal Contract Purchase (PCP) Auto', purpose: 'car', minAmount: 5000, maxAmount: 80000, rate: 0.062, minTerm: 2, maxTerm: 4, reqScore: 650, reqIncome: 20000, requiresProperty: false, requiresCar: true }
  ]
};

/* ============================================================
   5. FINANCIAL MATHEMATICS HELPER ENGINE
   ============================================================ */
const BankMath = {
  /**
   * Calculates maximum card limit based on income, credit score, and card tier caps
   */
  creditLimit(annualIncome, score, card) {
    const base = annualIncome * 0.25;
    let scoreMultiplier = 0.4;
    if (score >= 800) scoreMultiplier = 1.6;
    else if (score >= 740) scoreMultiplier = 1.3;
    else if (score >= 670) scoreMultiplier = 1.0;
    else if (score >= 580) scoreMultiplier = 0.7;

    const calculatedLimit = base * scoreMultiplier;
    return Math.min(card.maxLimit, Math.max(card.minLimit, Math.round(calculatedLimit)));
  },

  /**
   * Standard amortized monthly loan payment formula
   */
  loanPayment(principal, annualRate, years) {
    if (years <= 0 || principal <= 0) return 0;
    const monthlyRate = annualRate / 12;
    const numberOfPayments = years * 12;
    return Math.round((principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments)));
  },

  /**
   * Calculates total interest payable over life of loan
   */
  loanTotalInterest(principal, annualRate, years) {
    const monthlyPayment = BankMath.loanPayment(principal, annualRate, years);
    return Math.round((monthlyPayment * years * 12) - principal);
  },

  /**
   * Formats score into descriptive rating tier and hex color
   */
  scoreCategory(score) {
    if (score >= 800) return { label: 'Exceptional', color: '#10b981' };
    if (score >= 740) return { label: 'Very Good', color: '#06b6d4' };
    if (score >= 670) return { label: 'Good', color: '#8b5cf6' };
    if (score >= 580) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  },

  /**
   * Minimum monthly payment calculation for credit cards
   */
  cardMinPayment(card, balance) {
    if (balance <= 0) return 0;
    const pct = card.minPaymentPct || 0.05;
    const percentageAmount = balance * pct;
    const interestCharge = balance * (card.apr / 12);
    return Math.max(Math.round(percentageAmount), Math.round(interestCharge + 20));
  }
};
/* ============================================================
   6. GOLD & PRECIOUS METALS — Egyptian inflation hedge
   ============================================================
   Egypt-specific: gold is the #1 inflation hedge for Egyptians.
   Real 2026 prices. Buying/selling via banks or gold shops.
   ============================================================ */
const GOLD_PRICES = {
  egy: { perGram24K: 5200, perGram21K: 4500, perGram18K: 3800, dealerSpread: 0.03 },
  usa: { perGram24K: 85,   perGram21K: 74,   perGram18K: 63,   dealerSpread: 0.02 },
  sau: { perGram24K: 380,  perGram21K: 330,  perGram18K: 285,  dealerSpread: 0.02 },
  uae: { perGram24K: 380,  perGram21K: 330,  perGram18K: 285,  dealerSpread: 0.02 },
  uk:  { perGram24K: 68,   perGram21K: 59,   perGram18K: 50,   dealerSpread: 0.025 }
};

/* ============================================================
   7. DIGITAL WALLETS — Egyptian daily reality
   ============================================================
   Most Egyptians use these instead of traditional bank accounts.
   ============================================================ */
const DIGITAL_WALLETS = {
  egy: [
    { id: 'vodafone_cash', name: 'Vodafone Cash', provider: 'Vodafone Egypt', fees: 0, monthlyLimit: 30000, transferFee: 0.005, userBase: '18M+ users' },
    { id: 'instapay', name: 'InstaPay', provider: 'Central Bank of Egypt', fees: 0, monthlyLimit: 200000, transferFee: 0, userBase: 'All Egyptian banks' },
    { id: 'fawry', name: 'Fawry Wallet', provider: 'Fawry', fees: 0, monthlyLimit: 20000, transferFee: 0.005, userBase: 'Bill payments everywhere' },
    { id: 'valu', name: 'valU', provider: 'EFG Hermes', fees: 0, monthlyLimit: 200000, transferFee: 0, userBase: 'BNPL everywhere' },
    { id: 'mnt_halan', name: 'MNT-Halan', provider: 'MNT-Halan', fees: 0, monthlyLimit: 50000, transferFee: 0.003, userBase: 'Rural users' },
    { id: 'telda_wallet', name: 'Telda', provider: 'Telda', fees: 0, monthlyLimit: 100000, transferFee: 0, userBase: 'Neobank' }
  ],
  usa: [
    { id: 'venmo', name: 'Venmo', provider: 'PayPal', fees: 0, transferFee: 0.0175 },
    { id: 'cashapp', name: 'Cash App', provider: 'Block Inc', fees: 0, transferFee: 0.0175 },
    { id: 'zelle', name: 'Zelle', provider: 'Bank consortium', fees: 0, transferFee: 0 },
    { id: 'apple_pay', name: 'Apple Pay', provider: 'Apple', fees: 0, transferFee: 0 },
    { id: 'google_pay', name: 'Google Pay', provider: 'Google', fees: 0, transferFee: 0 }
  ],
  sau: [
    { id: 'stc_pay', name: 'STC Pay', provider: 'STC', fees: 0, transferFee: 0 },
    { id: 'apple_pay_sa', name: 'Apple Pay', provider: 'Apple', fees: 0, transferFee: 0 },
    { id: 'mada_pay', name: 'mada Pay', provider: 'Saudi Payments', fees: 0, transferFee: 0 }
  ],
  uae: [
    { id: 'careem_pay', name: 'Careem Pay', provider: 'Careem', fees: 0, transferFee: 0 },
    { id: 'eand_money', name: 'e& money', provider: 'e& (Etisalat)', fees: 0, transferFee: 0 }
  ],
  uk: [
    { id: 'monzo_wallet', name: 'Monzo', provider: 'Monzo Bank', fees: 0, transferFee: 0 },
    { id: 'revolut', name: 'Revolut', provider: 'Revolut', fees: 0, transferFee: 0, multiCurrency: true },
    { id: 'wise', name: 'Wise', provider: 'Wise', fees: 0, transferFee: 0.0041, multiCurrency: true }
  ]
};

/* ============================================================
   8. REMITTANCE SERVICES — for sending money home
   ============================================================
   Critical for Egyptian expats in Gulf / West. Reads/writes
   S.wealth when sending money to family back home.
   ============================================================ */
const REMITTANCE_SERVICES = {
  egy: [
    { id: 'western_union', name: 'Western Union', feePct: 0.025, speed: 'minutes', maxPerTransfer: 50000 },
    { id: 'moneygram', name: 'MoneyGram', feePct: 0.022, speed: 'minutes', maxPerTransfer: 50000 },
    { id: 'wise', name: 'Wise', feePct: 0.006, speed: '1-2 days', maxPerTransfer: 500000 },
    { id: 'instapay_intl', name: 'InstaPay International', feePct: 0.015, speed: 'same day', maxPerTransfer: 100000 }
  ],
  /* From abroad TO Egypt — the reverse direction */
  foreign_to_egy: [
    { id: 'wu_intl', name: 'Western Union to Egypt', feePct: 0.04, speed: 'minutes' },
    { id: 'wise_intl', name: 'Wise to Egypt', feePct: 0.008, speed: '1 day' },
    { id: 'bank_transfer_intl', name: 'International bank transfer', feePct: 0.015, speed: '2-5 days' }
  ]
};

/* ============================================================
   9. GOVERNMENT BONDS & TREASURY BILLS — safe investments
   ============================================================ */
const GOV_BONDS = {
  egy: [
    { id: 'tbill_91d', name: '91-Day Treasury Bill', yield: 0.275, minAmount: 5000, termDays: 91, risk: 'sovereign' },
    { id: 'tbill_182d', name: '182-Day Treasury Bill', yield: 0.265, minAmount: 5000, termDays: 182, risk: 'sovereign' },
    { id: 'tbill_364d', name: '364-Day Treasury Bill', yield: 0.245, minAmount: 5000, termDays: 364, risk: 'sovereign' },
    { id: 'bond_3yr', name: '3-Year Treasury Bond', yield: 0.235, minAmount: 10000, termDays: 1095, risk: 'sovereign' },
    { id: 'bond_5yr', name: '5-Year Treasury Bond', yield: 0.220, minAmount: 10000, termDays: 1825, risk: 'sovereign' },
    { id: 'bond_10yr', name: '10-Year Treasury Bond', yield: 0.195, minAmount: 10000, termDays: 3650, risk: 'sovereign' }
  ],
  usa: [
    { id: 'tbill_4w', name: '4-Week T-Bill', yield: 0.0430, minAmount: 100, termDays: 28, risk: 'sovereign' },
    { id: 'tbill_13w', name: '13-Week T-Bill', yield: 0.0445, minAmount: 100, termDays: 91, risk: 'sovereign' },
    { id: 'tbill_26w', name: '26-Week T-Bill', yield: 0.0435, minAmount: 100, termDays: 182, risk: 'sovereign' },
    { id: 'tnote_2yr', name: '2-Year T-Note', yield: 0.0420, minAmount: 100, termDays: 730, risk: 'sovereign' },
    { id: 'tnote_5yr', name: '5-Year T-Note', yield: 0.0430, minAmount: 100, termDays: 1825, risk: 'sovereign' },
    { id: 'tnote_10yr', name: '10-Year T-Note', yield: 0.0445, minAmount: 100, termDays: 3650, risk: 'sovereign' }
  ],
  sau: [
    { id: 'sukuk_5yr', name: 'Saudi Government Sukuk (5-Year)', yield: 0.0480, minAmount: 1000, termDays: 1825, risk: 'sovereign' },
    { id: 'sukuk_10yr', name: 'Saudi Government Sukuk (10-Year)', yield: 0.0510, minAmount: 1000, termDays: 3650, risk: 'sovereign' }
  ],
  uae: [
    { id: 'mbill_1yr', name: 'UAE M-Bill 1-Year', yield: 0.0480, minAmount: 5000, termDays: 365, risk: 'sovereign' },
    { id: 'bond_5yr', name: 'UAE Federal Bond 5-Year', yield: 0.0450, minAmount: 5000, termDays: 1825, risk: 'sovereign' }
  ],
  uk: [
    { id: 'gilt_1yr', name: 'UK Gilt 1-Year', yield: 0.0480, minAmount: 100, termDays: 365, risk: 'sovereign' },
    { id: 'gilt_5yr', name: 'UK Gilt 5-Year', yield: 0.0420, minAmount: 100, termDays: 1825, risk: 'sovereign' },
    { id: 'gilt_10yr', name: 'UK Gilt 10-Year', yield: 0.0430, minAmount: 100, termDays: 3650, risk: 'sovereign' }
  ]
};

/* ============================================================
   10. INVESTMENT FUNDS — stocks, ETFs, mutual funds
   ============================================================
   Reads S.wealth. Writes S.bank.investments.
   ============================================================ */
const INVESTMENT_PRODUCTS = {
  egy: [
    { id: 'egx30_index', name: 'EGX 30 Index Fund', provider: 'Multiple', expectedReturn: 0.22, volatility: 0.28, minInvestment: 5000, risk: 'high' },
    { id: 'beltone_growth', name: 'Beltone Growth Equity Fund', provider: 'Beltone', expectedReturn: 0.25, volatility: 0.30, minInvestment: 50000, risk: 'high' },
    { id: 'efg_hermes_fund', name: 'EFG Hermes Money Market Fund', provider: 'EFG Hermes', expectedReturn: 0.225, volatility: 0.02, minInvestment: 10000, risk: 'low' },
    { id: 'ci_capital_bond', name: 'CI Capital Bond Fund', provider: 'CI Capital', expectedReturn: 0.19, volatility: 0.05, minInvestment: 25000, risk: 'low' },
    { id: 'azimut_equity', name: 'Azimut Egypt Equity Fund', provider: 'Azimut', expectedReturn: 0.24, volatility: 0.26, minInvestment: 25000, risk: 'high' },
    { id: 'tadawul_gold', name: 'Gold Bullion Fund (via bank)', provider: 'CIB / NBE', expectedReturn: 0.15, volatility: 0.12, minInvestment: 20000, risk: 'medium' }
  ],
  usa: [
    { id: 'vanguard_sp500', name: 'Vanguard S&P 500 ETF (VOO)', provider: 'Vanguard', expectedReturn: 0.10, volatility: 0.16, minInvestment: 0, risk: 'medium' },
    { id: 'vti_total', name: 'Vanguard Total Stock Market (VTI)', provider: 'Vanguard', expectedReturn: 0.09, volatility: 0.15, minInvestment: 0, risk: 'medium' },
    { id: 'qqq_nasdaq', name: 'Invesco QQQ Nasdaq 100', provider: 'Invesco', expectedReturn: 0.12, volatility: 0.22, minInvestment: 0, risk: 'high' },
    { id: 'bond_agg', name: 'iShares Core US Aggregate Bond (AGG)', provider: 'BlackRock', expectedReturn: 0.045, volatility: 0.05, minInvestment: 0, risk: 'low' },
    { id: 'schwab_target_2055', name: 'Schwab Target 2055 Index Fund', provider: 'Schwab', expectedReturn: 0.08, volatility: 0.14, minInvestment: 0, risk: 'medium' },
    { id: 'gold_gld', name: 'SPDR Gold Shares (GLD)', provider: 'SPDR', expectedReturn: 0.06, volatility: 0.12, minInvestment: 0, risk: 'medium' }
  ],
  sau: [
    { id: 'tadawul_index', name: 'Tadawul All-Share Index Fund', provider: 'Riyad Capital', expectedReturn: 0.11, volatility: 0.20, minInvestment: 10000, risk: 'high' },
    { id: 'snb_income', name: 'SNB Income Fund', provider: 'SNB', expectedReturn: 0.06, volatility: 0.04, minInvestment: 50000, risk: 'low' },
    { id: 'b_saudi_equity', name: 'Saudi Equity Growth Fund', provider: 'Al Rajhi', expectedReturn: 0.10, volatility: 0.18, minInvestment: 25000, risk: 'medium' }
  ],
  uae: [
    { id: 'dfm_index', name: 'Dubai Financial Market Index Fund', provider: 'Emirates NBD', expectedReturn: 0.12, volatility: 0.20, minInvestment: 10000, risk: 'high' },
    { id: 'adx_index', name: 'Abu Dhabi Exchange Fund', provider: 'FAB', expectedReturn: 0.11, volatility: 0.18, minInvestment: 10000, risk: 'high' },
    { id: 'global_equity', name: 'Global Equity Fund', provider: 'Mashreq', expectedReturn: 0.09, volatility: 0.15, minInvestment: 25000, risk: 'medium' }
  ],
  uk: [
    { id: 'ftse_all_share', name: 'FTSE All-Share Index Fund', provider: 'Vanguard UK', expectedReturn: 0.075, volatility: 0.14, minInvestment: 100, risk: 'medium' },
    { id: 'lifestrategy_60', name: 'Vanguard LifeStrategy 60% Equity', provider: 'Vanguard UK', expectedReturn: 0.065, volatility: 0.10, minInvestment: 100, risk: 'medium' },
    { id: 'isa_cash', name: 'Cash ISA (tax-free savings)', provider: 'Multiple', expectedReturn: 0.042, volatility: 0, minInvestment: 1, risk: 'none', taxFree: true }
  ]
};

/* ============================================================
   11. RETIREMENT & PENSION PRODUCTS
   ============================================================ */
const PENSION_PRODUCTS = {
  egy: [
    { id: 'national_pension', name: 'National Social Insurance (الهيئة القومية)', provider: 'Government', contributionRate: 0.11, employerRate: 0.1875, retirementAge: 60, expectedReturn: 0.09 },
    { id: 'private_pension', name: 'Private Pension Fund', provider: 'Multiple banks', contributionRate: 0.08, employerRate: 0.04, retirementAge: 60, expectedReturn: 0.12 }
  ],
  usa: [
    { id: '401k', name: '401(k) Retirement Plan', provider: 'Employer', contributionRate: 0.10, employerMatch: 0.05, retirementAge: 59.5, expectedReturn: 0.08, taxAdvantaged: true },
    { id: 'roth_ira', name: 'Roth IRA', provider: 'Fidelity / Schwab / Vanguard', contributionRate: 0.06, employerMatch: 0, retirementAge: 59.5, expectedReturn: 0.08, taxAdvantaged: true, annualLimit: 7000 },
    { id: 'traditional_ira', name: 'Traditional IRA', provider: 'Fidelity / Schwab', contributionRate: 0.06, employerMatch: 0, retirementAge: 59.5, expectedReturn: 0.08, taxAdvantaged: true, annualLimit: 7000 },
    { id: 'social_security', name: 'Social Security', provider: 'US Government', contributionRate: 0.062, employerRate: 0.062, retirementAge: 67, expectedReturn: 0.03 }
  ],
  sau: [
    { id: 'gosi', name: 'GOSI (General Organization for Social Insurance)', provider: 'Government', contributionRate: 0.095, employerRate: 0.115, retirementAge: 60, expectedReturn: 0.06 }
  ],
  uae: [
    { id: 'gpssa', name: 'GPSSA (for UAE nationals)', provider: 'Government', contributionRate: 0.05, employerRate: 0.125, retirementAge: 60, expectedReturn: 0.06 },
    { id: 'dews', name: 'DIFC Employee Workplace Savings (DEWS)', provider: 'DIFC', contributionRate: 0.055, employerRate: 0.055, retirementAge: 60, expectedReturn: 0.07 }
  ],
  uk: [
    { id: 'state_pension', name: 'UK State Pension', provider: 'Government', contributionRate: 0.08, employerRate: 0.138, retirementAge: 66, expectedReturn: 0.03 },
    { id: 'workplace_pension', name: 'Workplace Auto-Enrollment Pension', provider: 'Multiple', contributionRate: 0.05, employerRate: 0.03, retirementAge: 55, expectedReturn: 0.07 },
    { id: 'sipp', name: 'Self-Invested Personal Pension (SIPP)', provider: 'Multiple', contributionRate: 0.20, employerMatch: 0, retirementAge: 55, expectedReturn: 0.075, taxAdvantaged: true }
  ]
};

/* ============================================================
   12. INSURANCE PRODUCTS — sold by banks
   ============================================================ */
const INSURANCE_PRODUCTS = {
  egy: [
    { id: 'home_misr', name: 'Misr Insurance — Home', type: 'home', provider: 'Misr Insurance', annualRate: 0.0025, maxCoverage: 5000000, deductible: 0.01 },
    { id: 'home_allianz', name: 'Allianz Egypt — Home', type: 'home', provider: 'Allianz', annualRate: 0.0030, maxCoverage: 10000000, deductible: 0.008 },
    { id: 'life_metlife', name: 'MetLife Egypt — Life', type: 'life', provider: 'MetLife', annualRate: 0.0040, maxCoverage: 5000000 },
    { id: 'life_axa', name: 'AXA Egypt — Life', type: 'life', provider: 'AXA', annualRate: 0.0035, maxCoverage: 3000000 },
    { id: 'health_bupa', name: 'Bupa Egypt — Health', type: 'health', provider: 'Bupa', annualRate: 0.015, maxCoverage: 2000000 },
    { id: 'car_misr', name: 'Misr Insurance — Car (Comprehensive)', type: 'car', provider: 'Misr Insurance', annualRate: 0.035, maxCoverage: 'market_value' },
    { id: 'travel_axa', name: 'AXA Egypt — Travel', type: 'travel', provider: 'AXA', annualRate: 0.008, maxCoverage: 500000 }
  ],
  usa: [
    { id: 'home_allstate', name: 'Allstate — Homeowners', type: 'home', provider: 'Allstate', annualRate: 0.005, maxCoverage: 2000000, deductible: 0.01 },
    { id: 'home_statefarm', name: 'State Farm — Homeowners', type: 'home', provider: 'State Farm', annualRate: 0.0045, maxCoverage: 2000000, deductible: 0.01 },
    { id: 'life_northwestern', name: 'Northwestern Mutual — Term Life', type: 'life', provider: 'Northwestern Mutual', annualRate: 0.0025, maxCoverage: 1000000 },
    { id: 'life_metlife_usa', name: 'MetLife — Term Life', type: 'life', provider: 'MetLife', annualRate: 0.0030, maxCoverage: 500000 },
    { id: 'health_kaiser', name: 'Kaiser Permanente — Health', type: 'health', provider: 'Kaiser', annualRate: 0.06, maxCoverage: 'unlimited' },
    { id: 'car_geico', name: 'Geico — Auto', type: 'car', provider: 'Geico', annualRate: 0.05, maxCoverage: 'market_value' }
  ],
  sau: [
    { id: 'home_bupa', name: 'Bupa Arabia — Home', type: 'home', provider: 'Bupa Arabia', annualRate: 0.0020, maxCoverage: 3000000, deductible: 0.01 },
    { id: 'life_tawuniya', name: 'Tawuniya — Life', type: 'life', provider: 'Tawuniya', annualRate: 0.0030, maxCoverage: 2000000 },
    { id: 'car_tawuniya', name: 'Tawuniya — Car (Comprehensive)', type: 'car', provider: 'Tawuniya', annualRate: 0.045, maxCoverage: 'market_value' }
  ],
  uae: [
    { id: 'home_axa', name: 'AXA UAE — Home', type: 'home', provider: 'AXA UAE', annualRate: 0.0025, maxCoverage: 5000000, deductible: 0.01 },
    { id: 'life_oman', name: 'Oman Insurance — Life', type: 'life', provider: 'Oman Insurance', annualRate: 0.0035, maxCoverage: 3000000 },
    { id: 'car_oman', name: 'Oman Insurance — Car', type: 'car', provider: 'Oman Insurance', annualRate: 0.045, maxCoverage: 'market_value' }
  ],
  uk: [
    { id: 'home_aviva', name: 'Aviva — Home', type: 'home', provider: 'Aviva', annualRate: 0.0015, maxCoverage: 1000000, deductible: 0.015 },
    { id: 'life_aviva', name: 'Aviva — Term Life', type: 'life', provider: 'Aviva', annualRate: 0.0025, maxCoverage: 500000 },
    { id: 'car_direct_line', name: 'Direct Line — Car', type: 'car', provider: 'Direct Line', annualRate: 0.040, maxCoverage: 'market_value' }
  ]
};

/* ============================================================
   13. OVERDRAFT & EMERGENCY PRODUCTS
   ============================================================
   Use case: player has negative cash (from real estate year tick
   or life events). This fixes the "stuck with -50,000" problem.
   ============================================================ */
const OVERDRAFT_PRODUCTS = {
  egy: [
    { id: 'cib_overdraft', bankId: 'cib', name: 'CIB Overdraft Facility', maxAmount: 200000, apr: 0.22, minIncome: 15000 },
    { id: 'nbe_overdraft', bankId: 'nbe', name: 'NBE Overdraft', maxAmount: 100000, apr: 0.20, minIncome: 10000 }
  ],
  usa: [
    { id: 'chase_overdraft', bankId: 'chase', name: 'Chase Overdraft Protection', maxAmount: 5000, apr: 0.18, minIncome: 2500 },
    { id: 'bofa_overdraft', bankId: 'bofa', name: 'BofA Overdraft Line', maxAmount: 3000, apr: 0.17, minIncome: 2000 }
  ],
  sau: [
    { id: 'snb_overdraft', bankId: 'snb', name: 'SNB Overdraft Facility', maxAmount: 100000, apr: 0.06, minIncome: 8000 }
  ],
  uae: [
    { id: 'enbd_overdraft', bankId: 'emirates_nbd', name: 'Emirates NBD Overdraft', maxAmount: 200000, apr: 0.075, minIncome: 10000 }
  ],
  uk: [
    { id: 'barclays_overdraft', bankId: 'barclays', name: 'Barclays Arranged Overdraft', maxAmount: 5000, apr: 0.35, minIncome: 1500 }
  ]
};

/* ============================================================
   14. SAVINGS GOALS — user-defined targets
   ============================================================
   Player sets "I want to save X for Y". System auto-tracks.
   Connects to real estate: "Save 500k for apartment down payment"
   ============================================================ */
const SAVINGS_GOAL_TEMPLATES = {
  egy: [
    { id: 'emergency', name: 'Emergency Fund', targetAmount: 100000, note: '3 months of expenses' },
    { id: 'apartment_down', name: 'Apartment Down Payment', targetAmount: 500000, note: '20% of a 2.5M apartment' },
    { id: 'car_down', name: 'Car Down Payment', targetAmount: 200000, note: '20% of a 1M car' },
    { id: 'wedding', name: 'Wedding Fund', targetAmount: 300000, note: 'Shabka + wedding party' },
    { id: 'abroad_study', name: 'Study Abroad Fund', targetAmount: 800000, note: 'Blocked account + tuition' },
    { id: 'gulf_trip', name: 'Gulf Trip', targetAmount: 50000, note: '2 weeks' },
    { id: 'europe_trip', name: 'Europe Trip', targetAmount: 120000, note: 'Schengen vacation' }
  ],
  usa: [
    { id: 'emergency', name: 'Emergency Fund', targetAmount: 15000, note: '6 months of expenses' },
    { id: 'house_down', name: 'House Down Payment', targetAmount: 60000, note: '10-20% of a house' },
    { id: 'car_down', name: 'Car Down Payment', targetAmount: 5000, note: '20% down' },
    { id: '401k_max', name: 'Max out 401(k)', targetAmount: 23000, note: 'Annual contribution limit' },
    { id: 'wedding', name: 'Wedding', targetAmount: 25000, note: 'Average US wedding' }
  ],
  sau: [
    { id: 'emergency', name: 'Emergency Fund', targetAmount: 50000, note: '3 months' },
    { id: 'house_down', name: 'House Down Payment', targetAmount: 150000, note: '15% of a villa' },
    { id: 'car_down', name: 'Car Down Payment', targetAmount: 40000, note: '20% of a 200k car' },
    { id: 'wedding', name: 'Wedding Fund', targetAmount: 200000, note: 'Mahr + party' }
  ],
  uae: [
    { id: 'emergency', name: 'Emergency Fund', targetAmount: 60000, note: '3 months' },
    { id: 'house_down', name: 'Property Down Payment', targetAmount: 200000, note: '20% of AED 1M' },
    { id: 'car_down', name: 'Car Down Payment', targetAmount: 50000, note: '20% down' }
  ],
  uk: [
    { id: 'emergency', name: 'Emergency Fund', targetAmount: 10000, note: '6 months' },
    { id: 'house_deposit', name: 'House Deposit', targetAmount: 40000, note: '10% deposit' },
    { id: 'car', name: 'Car Purchase', targetAmount: 15000, note: 'Used car' }
  ]
};

/* ============================================================
   15. BANKS ADDITIONS — Amex, Discover, more neobanks
   ============================================================
   Fix for amex_gold and discover_it card references.
   ============================================================ */

/* Add to BANKS.usa: */
BANKS.usa.push(
  { id: 'amex', name: 'American Express', shortName: 'Amex', founded: 1850, reputation: 5, savingsRate: 0.0001, type: 'commercial' },
  { id: 'discover', name: 'Discover Financial Services', shortName: 'Discover', founded: 1985, reputation: 4, savingsRate: 0.0400, type: 'commercial' }
);

/* Add to BANKS.egy: */
BANKS.egy.push(
  { id: 'nasser_social', name: 'Nasser Social Bank', shortName: 'NSB', founded: 1971, reputation: 3, savingsRate: 0.018, type: 'state' }
);

/* Add to BANKS.uae: */
BANKS.uae.push(
  { id: 'cbd', name: 'Commercial Bank of Dubai', shortName: 'CBD', founded: 1969, reputation: 4, savingsRate: 0.016, type: 'commercial' },
  { id: 'rakbank', name: 'RAKBANK', shortName: 'RAKBANK', founded: 1976, reputation: 4, savingsRate: 0.018, type: 'commercial' }
);

/* Add to BANKS.uk: */
BANKS.uk.push(
  { id: 'santander_uk', name: 'Santander UK', shortName: 'Santander', founded: 2010, reputation: 4, savingsRate: 0.016, type: 'commercial' },
  { id: 'nationwide', name: 'Nationwide Building Society', shortName: 'Nationwide', founded: 1884, reputation: 5, savingsRate: 0.019, type: 'building_society' }
);

/* ============================================================
   16. EXPORTS — extended globals
   ============================================================ */
window.GOLD_PRICES = GOLD_PRICES;
window.DIGITAL_WALLETS = DIGITAL_WALLETS;
window.REMITTANCE_SERVICES = REMITTANCE_SERVICES;
window.GOV_BONDS = GOV_BONDS;
window.INVESTMENT_PRODUCTS = INVESTMENT_PRODUCTS;
window.PENSION_PRODUCTS = PENSION_PRODUCTS;
window.INSURANCE_PRODUCTS = INSURANCE_PRODUCTS;
window.OVERDRAFT_PRODUCTS = OVERDRAFT_PRODUCTS;
window.SAVINGS_GOAL_TEMPLATES = SAVINGS_GOAL_TEMPLATES;
/* Bind to global scope for browser compatibility */
window.BANKS = BANKS;
window.CERTIFICATES = CERTIFICATES;
window.CREDIT_CARDS = CREDIT_CARDS;
window.LOAN_PRODUCTS = LOAN_PRODUCTS;
window.BankMath = BankMath;
