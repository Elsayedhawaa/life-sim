/* ============================================================================
   World Life Complete Edition — 100% v1 Banking, Credit Cards, Loans & Markets
   Includes 129 Banks (unified: V1_BANKS is institutions.js BANKS — one table, never two), 84+ Credit Cards (8 Tiers), 89+ Loans, 102+ CDs,
   Digital Wallets, Remittances (incl. Hawala), and 20 Global/Regional Markets.
   ========================================================================== */

import { BANKS } from './institutions.js';

// v2.1: V1_BANKS is an alias of the single BANKS table in institutions.js.
// The two tables used to disagree (102 vs 111 entries); they can never disagree again.
export const V1_BANKS = BANKS;;
export const V1_CERTIFICATES = {
  "egy": [
    {
      "id": "nbe_platinum_monthly",
      "bankId": "nbe",
      "name": "NBE Platinum 3-Year (Monthly)",
      "term": 3,
      "minAmount": 1000,
      "rates": [
        0.215,
        0.215,
        0.215
      ],
      "payout": "monthly",
      "earlyPenalty": 0.095
    },
    {
      "id": "nbe_platinum_yearly",
      "bankId": "nbe",
      "name": "NBE Platinum 1-Year High-Yield",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.27
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.08
    },
    {
      "id": "bm_alqimma",
      "bankId": "banque_misr",
      "name": "Al Qimma Certificate",
      "term": 3,
      "minAmount": 1000,
      "rates": [
        0.215,
        0.215,
        0.215
      ],
      "payout": "monthly",
      "earlyPenalty": 0.095
    },
    {
      "id": "bm_ibnmisr",
      "bankId": "banque_misr",
      "name": "Ibn Misr (Descending Yield)",
      "term": 3,
      "minAmount": 1000,
      "rates": [
        0.3,
        0.25,
        0.2
      ],
      "payout": "annually",
      "earlyPenalty": 0.1
    },
    {
      "id": "cib_premium",
      "bankId": "cib",
      "name": "CIB Premium 3-Year CD",
      "term": 3,
      "minAmount": 1000000,
      "rates": [
        0.22,
        0.22,
        0.22
      ],
      "payout": "monthly",
      "earlyPenalty": 0.09
    },
    {
      "id": "cib_prime",
      "bankId": "cib",
      "name": "CIB Prime 3-Year CD",
      "term": 3,
      "minAmount": 100000,
      "rates": [
        0.2,
        0.2,
        0.2
      ],
      "payout": "monthly",
      "earlyPenalty": 0.085
    },
    {
      "id": "alexbank_cdmax",
      "bankId": "alexbank",
      "name": "CD MAX High-Yield",
      "term": 3,
      "minAmount": 500000,
      "rates": [
        0.21,
        0.21,
        0.21
      ],
      "payout": "monthly",
      "earlyPenalty": 0.09
    },
    {
      "id": "aaib_golden",
      "bankId": "aaib",
      "name": "AAIB Golden Certificate",
      "term": 3,
      "minAmount": 50000,
      "rates": [
        0.225,
        0.225,
        0.225
      ],
      "payout": "quarterly",
      "earlyPenalty": 0.092
    },
    {
      "id": "adib_murabaha",
      "bankId": "adib_egy",
      "name": "ADIB Murabaha Deposit Certificate",
      "term": 3,
      "minAmount": 10000,
      "rates": [
        0.21,
        0.21,
        0.21
      ],
      "payout": "monthly",
      "earlyPenalty": 0.08
    },
    {
      "id": "nbe_usd_al_ahly",
      "bankId": "nbe",
      "name": "NBE Al-Ahly USD Certificate",
      "term": 3,
      "minAmount": 1000,
      "rates": [
        0.07,
        0.07,
        0.07
      ],
      "payout": "quarterly",
      "earlyPenalty": 0.03
    }
  ],
  "usa": [
    {
      "id": "ally_1yr",
      "bankId": "ally",
      "name": "Ally High Yield 12-Month CD",
      "term": 1,
      "minAmount": 0,
      "rates": [
        0.045
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.007
    },
    {
      "id": "ally_3yr",
      "bankId": "ally",
      "name": "Ally 3-Year Fixed CD",
      "term": 3,
      "minAmount": 0,
      "rates": [
        0.042,
        0.042,
        0.042
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.012
    },
    {
      "id": "marcus_1yr",
      "bankId": "marcus",
      "name": "Marcus 1-Year High Yield CD",
      "term": 1,
      "minAmount": 500,
      "rates": [
        0.047
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.008
    },
    {
      "id": "chase_1yr",
      "bankId": "chase",
      "name": "Chase Standard 12-Month CD",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.03
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "capone_1yr",
      "bankId": "capital_one",
      "name": "Capital One 360 12-Month CD",
      "term": 1,
      "minAmount": 0,
      "rates": [
        0.046
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.008
    },
    {
      "id": "fidelity_cd_ladder",
      "bankId": "fidelity",
      "name": "Fidelity Brokered 2-Year CD",
      "term": 2,
      "minAmount": 1000,
      "rates": [
        0.048,
        0.048
      ],
      "payout": "semi_annually",
      "earlyPenalty": 0.015
    }
  ],
  "sau": [
    {
      "id": "snb_murabaha_1yr",
      "bankId": "snb",
      "name": "SNB Al-Ahal Murabaha Deposit",
      "term": 1,
      "minAmount": 20000,
      "rates": [
        0.052
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.008
    },
    {
      "id": "rajhi_al_mukhtart",
      "bankId": "al_rajhi",
      "name": "Al Rajhi Al-Mukhtar Savings CD",
      "term": 1,
      "minAmount": 10000,
      "rates": [
        0.051
      ],
      "payout": "monthly",
      "earlyPenalty": 0.007
    },
    {
      "id": "riyad_al_yusr_3yr",
      "bankId": "riyad",
      "name": "Riyad Bank Al-Yusr 3-Year Deposit",
      "term": 3,
      "minAmount": 50000,
      "rates": [
        0.048,
        0.048,
        0.048
      ],
      "payout": "quarterly",
      "earlyPenalty": 0.01
    },
    {
      "id": "alinma_murabaha",
      "bankId": "alinma",
      "name": "Alinma Investment Murabaha CD",
      "term": 1,
      "minAmount": 25000,
      "rates": [
        0.0535
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.009
    }
  ],
  "uae": [
    {
      "id": "enbd_1yr_fixed",
      "bankId": "emirates_nbd",
      "name": "Emirates NBD 12-Month Fixed Deposit",
      "term": 1,
      "minAmount": 10000,
      "rates": [
        0.0475
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "fab_high_yield",
      "bankId": "fab",
      "name": "FAB High-Yield 1-Year Deposit",
      "term": 1,
      "minAmount": 25000,
      "rates": [
        0.051
      ],
      "payout": "quarterly",
      "earlyPenalty": 0.012
    },
    {
      "id": "adcb_millionaire",
      "bankId": "adcb",
      "name": "ADCB Millionaire Savings Certificate",
      "term": 1,
      "minAmount": 5000,
      "rates": [
        0.035
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "wio_space_cd",
      "bankId": "wio",
      "name": "Wio Save Space 12-Month CD",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.0525
      ],
      "payout": "monthly",
      "earlyPenalty": 0.005
    }
  ],
  "gbr": [
    {
      "id": "hsbc_1yr_fixed",
      "bankId": "hsbc_uk",
      "name": "HSBC Fixed Rate Saver 1-Year",
      "term": 1,
      "minAmount": 2000,
      "rates": [
        0.046
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "barclays_1yr_bond",
      "bankId": "barclays",
      "name": "Barclays 1-Year Fixed Rate Bond",
      "term": 1,
      "minAmount": 500,
      "rates": [
        0.045
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "monzo_growth_pot",
      "bankId": "monzo",
      "name": "Monzo Fixed Savings Pot 12-Mo",
      "term": 1,
      "minAmount": 500,
      "rates": [
        0.048
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "starling_fixed_saver",
      "bankId": "starling",
      "name": "Starling 1-Year Fixed Saver",
      "term": 1,
      "minAmount": 2000,
      "rates": [
        0.047
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    }
  ],
  "deu": [
    {
      "id": "db_1yr",
      "bankId": "db",
      "name": "DB FestzinsSparen 1 Year",
      "term": 1,
      "minAmount": 2500,
      "rates": [
        0.035
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "ing_1yr",
      "bankId": "ing_diba",
      "name": "ING Festgeld 1 Year",
      "term": 1,
      "minAmount": 10000,
      "rates": [
        0.0375
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "dkb_1yr",
      "bankId": "dkb",
      "name": "DKB-Festgeld 1 Year",
      "term": 1,
      "minAmount": 2500,
      "rates": [
        0.035
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    }
  ],
  "can": [
    {
      "id": "td_1yr_gic",
      "bankId": "td",
      "name": "TD 1-Year Non-Cashable GIC",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.045
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.02
    },
    {
      "id": "tangerine_1yr_gic",
      "bankId": "tangerine",
      "name": "Tangerine 1-Year GIC",
      "term": 1,
      "minAmount": 0,
      "rates": [
        0.05
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "rbc_1yr_gic",
      "bankId": "rbc",
      "name": "RBC 1-Year Non-Redeemable GIC",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.0425
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.02
    }
  ],
  "aus": [
    {
      "id": "cba_1yr_term",
      "bankId": "cba",
      "name": "CommBank 12-Month Term Deposit",
      "term": 1,
      "minAmount": 5000,
      "rates": [
        0.0475
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.015
    },
    {
      "id": "macquarie_1yr_term",
      "bankId": "macquarie",
      "name": "Macquarie 1-Year Term Deposit",
      "term": 1,
      "minAmount": 5000,
      "rates": [
        0.05
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "ing_aus_1yr_term",
      "bankId": "ing_aus",
      "name": "ING 1-Year Term Deposit",
      "term": 1,
      "minAmount": 10000,
      "rates": [
        0.051
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    }
  ],
  "nld": [
    {
      "id": "ing_nl_1yr",
      "bankId": "ing_nl",
      "name": "ING Spaardeposito 1 Year",
      "term": 1,
      "minAmount": 500,
      "rates": [
        0.03
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "rabobank_1yr",
      "bankId": "rabobank",
      "name": "Rabobank DoelSparen 1 Year",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.032
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "bunq_1yr",
      "bankId": "bunq",
      "name": "bunq 1-Year Fixed Deposit",
      "term": 1,
      "minAmount": 100,
      "rates": [
        0.035
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    }
  ],
  "fra": [
    {
      "id": "ca_1yr",
      "bankId": "credit_agricole_fra",
      "name": "Cr\u00e9dit Agricole Compte \u00e0 Terme 1 an",
      "term": 1,
      "minAmount": 5000,
      "rates": [
        0.035
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "bnpp_1yr",
      "bankId": "bnpp",
      "name": "BNP Paribas Compte \u00e0 Terme 1 an",
      "term": 1,
      "minAmount": 15000,
      "rates": [
        0.032
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    }
  ],
  "jpn": [
    {
      "id": "mufg_1yr",
      "bankId": "mufg",
      "name": "MUFG Super Time Deposit 1 Year",
      "term": 1,
      "minAmount": 100000,
      "rates": [
        2e-05
      ],
      "payout": "at_maturity",
      "earlyPenalty": 1e-05
    },
    {
      "id": "sbi_1yr",
      "bankId": "sbi_sumishin",
      "name": "SBI 1-Year Yen Term Deposit",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.002
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.0005
    }
  ],
  "ita": [
    {
      "id": "isp_1yr",
      "bankId": "isp",
      "name": "Intesa Sanpaolo Deposito Vincolato 1 Year",
      "term": 1,
      "minAmount": 10000,
      "rates": [
        0.03
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "illimity_1yr",
      "bankId": "illimity",
      "name": "illimity 1-Year Non-Cancellable Deposit",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.04
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.02
    }
  ],
  "sgp": [
    {
      "id": "dbs_1yr",
      "bankId": "dbs",
      "name": "DBS 12-Month Fixed Deposit",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.032
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    },
    {
      "id": "ocbc_1yr",
      "bankId": "ocbc",
      "name": "OCBC 12-Month Time Deposit",
      "term": 1,
      "minAmount": 5000,
      "rates": [
        0.034
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.005
    }
  ],
  "bra": [
    {
      "id": "itau_cdb_1yr",
      "bankId": "itau",
      "name": "Ita\u00fa CDB 1 Ano",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.105
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.02
    },
    {
      "id": "nubank_cdb_1yr",
      "bankId": "nubank",
      "name": "Nubank RDB 1 Ano",
      "term": 1,
      "minAmount": 100,
      "rates": [
        0.115
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.02
    },
    {
      "id": "inter_lci_1yr",
      "bankId": "inter",
      "name": "Banco Inter LCI 1 Ano (Tax-Free)",
      "term": 1,
      "minAmount": 100,
      "rates": [
        0.095
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.02
    }
  ],
  "ind": [
    {
      "id": "sbi_1yr_fd",
      "bankId": "sbi",
      "name": "SBI 1-Year Fixed Deposit",
      "term": 1,
      "minAmount": 1000,
      "rates": [
        0.068
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "hdfc_1yr_fd",
      "bankId": "hdfc",
      "name": "HDFC 1-Year Fixed Deposit",
      "term": 1,
      "minAmount": 10000,
      "rates": [
        0.071
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.01
    },
    {
      "id": "bajaj_fd",
      "bankId": "bajaj",
      "name": "Bajaj Finance 1-Year FD",
      "term": 1,
      "minAmount": 15000,
      "rates": [
        0.075
      ],
      "payout": "at_maturity",
      "earlyPenalty": 0.015
    }
  ]
};
export const V1_CREDIT_CARDS = {
  "egy": [
    {
      "id": "cib_classic",
      "bankId": "cib",
      "name": "CIB Classic Credit Card",
      "tier": "classic",
      "minLimit": 15000,
      "maxLimit": 80000,
      "apr": 0.38,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 580,
      "reqIncome": 96000,
      "perks": [
        "1% Bonus points cashback",
        "0% Installment plans at major merchants",
        "Free SMS notifications"
      ]
    },
    {
      "id": "cib_titanium",
      "bankId": "cib",
      "name": "CIB Titanium Mastercard",
      "tier": "gold",
      "minLimit": 80000,
      "maxLimit": 250000,
      "apr": 0.36,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.018,
      "reqScore": 650,
      "reqIncome": 240000,
      "perks": [
        "1.8% cashback",
        "Airport lounge access across MENA",
        "Buy-1-Get-1 dining offers"
      ]
    },
    {
      "id": "cib_wealth",
      "bankId": "cib",
      "name": "CIB Wealth Visa Infinite",
      "tier": "infinite",
      "minLimit": 400000,
      "maxLimit": 2000000,
      "apr": 0.32,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.035,
      "reqScore": 750,
      "reqIncome": 800000,
      "perks": [
        "3.5% cashback",
        "Unlimited worldwide lounge key access",
        "Personal Concierge 24/7",
        "Full travel insurance"
      ]
    },
    {
      "id": "nbe_classic",
      "bankId": "nbe",
      "name": "NBE Classic Mastercard",
      "tier": "classic",
      "minLimit": 10000,
      "maxLimit": 50000,
      "apr": 0.35,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 560,
      "reqIncome": 72000,
      "perks": [
        "Al Ahly points program",
        "55-day grace period"
      ]
    },
    {
      "id": "nbe_platinum",
      "bankId": "nbe",
      "name": "NBE Platinum Visa",
      "tier": "platinum",
      "minLimit": 100000,
      "maxLimit": 500000,
      "apr": 0.33,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.022,
      "reqScore": 680,
      "reqIncome": 360000,
      "perks": [
        "2.2% cashback",
        "Lounge access at 25 airports",
        "Purchase protection insurance"
      ]
    },
    {
      "id": "nbe_world_elite",
      "bankId": "nbe",
      "name": "NBE World Elite Mastercard",
      "tier": "infinite",
      "minLimit": 500000,
      "maxLimit": 3000000,
      "apr": 0.3,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.04,
      "reqScore": 780,
      "reqIncome": 1200000,
      "perks": [
        "4.0% cashback",
        "Global VIP airport access",
        "Free valet parking",
        "Comprehensive medical emergency cover"
      ]
    },
    {
      "id": "bm_titanium",
      "bankId": "banque_misr",
      "name": "Banque Misr Titanium Card",
      "tier": "gold",
      "minLimit": 30000,
      "maxLimit": 150000,
      "apr": 0.36,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.015,
      "reqScore": 620,
      "reqIncome": 140000,
      "perks": [
        "BM Rewards point multiplier",
        "12-month 0% interest promo"
      ]
    },
    {
      "id": "hsbc_premier",
      "bankId": "hsbc_egy",
      "name": "HSBC Premier Mastercard",
      "tier": "platinum",
      "minLimit": 200000,
      "maxLimit": 1200000,
      "apr": 0.31,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.025,
      "reqScore": 720,
      "reqIncome": 600000,
      "perks": [
        "2.5% rewards value",
        "Global HSBC Premier status sharing",
        "No FX markup on overseas travel"
      ]
    },
    {
      "id": "adib_covered_gold",
      "bankId": "adib_egy",
      "name": "ADIB Covered Gold Card (Sharia)",
      "tier": "gold",
      "minLimit": 25000,
      "maxLimit": 120000,
      "apr": 0.34,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.015,
      "reqScore": 610,
      "reqIncome": 120000,
      "perks": [
        "Fully Sharia compliant Murabaha structure",
        "ADIB Smiles rewards"
      ]
    }
  ],
  "usa": [
    {
      "id": "chase_freedom",
      "bankId": "chase",
      "name": "Chase Freedom Unlimited",
      "tier": "classic",
      "minLimit": 3000,
      "maxLimit": 25000,
      "apr": 0.22,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.015,
      "reqScore": 670,
      "reqIncome": 35000,
      "perks": [
        "1.5% unlimited cash back",
        "3% on dining & drugstores",
        "0% intro APR for 15 months"
      ]
    },
    {
      "id": "chase_sapphire",
      "bankId": "chase",
      "name": "Chase Sapphire Reserve",
      "tier": "infinite",
      "minLimit": 10000,
      "maxLimit": 75000,
      "apr": 0.23,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.035,
      "reqScore": 750,
      "reqIncome": 90000,
      "perks": [
        "$300 Annual Travel Credit",
        "3x on Travel & Dining",
        "Priority Pass Select Lounge Access",
        "Global Entry fee credit"
      ]
    },
    {
      "id": "amex_gold",
      "bankId": "amex",
      "name": "American Express Gold Card",
      "tier": "gold",
      "minLimit": 5000,
      "maxLimit": 50000,
      "apr": 0.24,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.025,
      "reqScore": 700,
      "reqIncome": 60000,
      "perks": [
        "4x at Restaurants & US Supermarkets",
        "$120 Uber Cash annually",
        "$120 Dining credit"
      ]
    },
    {
      "id": "capital_venture_x",
      "bankId": "capital_one",
      "name": "Capital One Venture X",
      "tier": "infinite",
      "minLimit": 10000,
      "maxLimit": 60000,
      "apr": 0.21,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 85000,
      "perks": [
        "10x on Hotels & Rental cars",
        "$300 Annual Capital One Travel credit",
        "Capital One & Plaza Premium lounge access"
      ]
    },
    {
      "id": "citi_double",
      "bankId": "citi",
      "name": "Citi Double Cash Card",
      "tier": "classic",
      "minLimit": 2000,
      "maxLimit": 20000,
      "apr": 0.2,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.02,
      "reqScore": 660,
      "reqIncome": 30000,
      "perks": [
        "2% flat cash back (1% when you buy, 1% when you pay)"
      ]
    },
    {
      "id": "discover_it",
      "bankId": "discover",
      "name": "Discover it Cash Back",
      "tier": "classic",
      "minLimit": 1500,
      "maxLimit": 15000,
      "apr": 0.19,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.025,
      "reqScore": 650,
      "reqIncome": 25000,
      "perks": [
        "5% rotating quarterly categories",
        "First year cashback match double bonus"
      ]
    }
  ],
  "sau": [
    {
      "id": "snb_alfursan",
      "bankId": "snb",
      "name": "SNB AlFursan Visa Infinite",
      "tier": "infinite",
      "minLimit": 50000,
      "maxLimit": 300000,
      "apr": 0.22,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 240000,
      "perks": [
        "1 AlFursan Air Mile per 3 SAR spent",
        "Unlimited airport lounges",
        "Free green fee at golf courses"
      ]
    },
    {
      "id": "rajhi_cashback_plus",
      "bankId": "al_rajhi",
      "name": "Al Rajhi Cashback Plus Signature",
      "tier": "platinum",
      "minLimit": 20000,
      "maxLimit": 150000,
      "apr": 0.24,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.025,
      "reqScore": 680,
      "reqIncome": 140000,
      "perks": [
        "2.5% cashback on international spend",
        "Sharia compliant Murabaha structure",
        "DragonPass lounge access"
      ]
    },
    {
      "id": "riyad_infinite",
      "bankId": "riyad",
      "name": "Riyad Bank Visa Infinite",
      "tier": "infinite",
      "minLimit": 60000,
      "maxLimit": 400000,
      "apr": 0.2,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.032,
      "reqScore": 760,
      "reqIncome": 300000,
      "perks": [
        "Multi-currency wallet zero FX",
        "Concierge desk",
        "Full family medical travel coverage"
      ]
    }
  ],
  "uae": [
    {
      "id": "enbd_skywards",
      "bankId": "emirates_nbd",
      "name": "Emirates NBD Skywards Infinite",
      "tier": "infinite",
      "minLimit": 40000,
      "maxLimit": 350000,
      "apr": 0.27,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.035,
      "reqScore": 730,
      "reqIncome": 300000,
      "perks": [
        "Up to 2 Skywards Miles per USD spent",
        "Emirates Silver Tier Status",
        "Unlimited Golf access in UAE"
      ]
    },
    {
      "id": "fab_cashback_infinite",
      "bankId": "fab",
      "name": "FAB Cashback Visa Infinite",
      "tier": "infinite",
      "minLimit": 30000,
      "maxLimit": 250000,
      "apr": 0.26,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.05,
      "reqScore": 720,
      "reqIncome": 240000,
      "perks": [
        "5% cash back on Supermarkets, Fuel, and Utilities",
        "VIP airport transfers"
      ]
    },
    {
      "id": "adcb_touchpoints",
      "bankId": "adcb",
      "name": "ADCB TouchPoints Titanium",
      "tier": "gold",
      "minLimit": 10000,
      "maxLimit": 80000,
      "apr": 0.29,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.015,
      "reqScore": 640,
      "reqIncome": 96000,
      "perks": [
        "TouchPoints reward catalog",
        "2-for-1 Vox Cinema tickets"
      ]
    }
  ],
  "gbr": [
    {
      "id": "barclaycard_avios",
      "bankId": "barclays",
      "name": "Barclaycard Avios Plus",
      "tier": "platinum",
      "minLimit": 3000,
      "maxLimit": 25000,
      "apr": 0.23,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.02,
      "reqScore": 720,
      "reqIncome": 35000,
      "perks": [
        "1.5 British Airways Avios per \u00a31",
        "Cabin Upgrade Voucher yearly"
      ]
    },
    {
      "id": "hsbc_premier_uk",
      "bankId": "hsbc_uk",
      "name": "HSBC Premier World Elite Card",
      "tier": "infinite",
      "minLimit": 8000,
      "maxLimit": 50000,
      "apr": 0.21,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.025,
      "reqScore": 760,
      "reqIncome": 75000,
      "perks": [
        "LoungeKey airport pass",
        "2 Reward points per \u00a31",
        "No foreign transaction fees"
      ]
    },
    {
      "id": "monzo_flex",
      "bankId": "monzo",
      "name": "Monzo Flex Credit Line",
      "tier": "classic",
      "minLimit": 500,
      "maxLimit": 6000,
      "apr": 0.22,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 630,
      "reqIncome": 18000,
      "perks": [
        "Split any purchase into 3 monthly interest-free payments"
      ]
    }
  ],
  "deu": [
    {
      "id": "deu_card_classic",
      "bankId": "db",
      "name": "Deutsche Bank Visa Card",
      "tier": "classic",
      "minLimit": 1800,
      "maxLimit": 15750,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 22500,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "deu_card_gold",
      "bankId": "commerzbank",
      "name": "Commerzbank Gold Karte",
      "tier": "gold",
      "since": 1983,
      "minLimit": 4500,
      "maxLimit": 31500,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 40500,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "deu_card_platinum",
      "bankId": "ing_diba",
      "name": "DKB Visa Platinum",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 9000,
      "maxLimit": 54000,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 81000,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "can": [
    {
      "id": "can_card_classic",
      "bankId": "rbc",
      "name": "Scotiabank Value Visa",
      "tier": "classic",
      "minLimit": 2600,
      "maxLimit": 22750,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 32500,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "can_card_gold",
      "bankId": "td",
      "name": "RBC Visa Gold",
      "tier": "gold",
      "since": 1983,
      "minLimit": 6500,
      "maxLimit": 45500,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 58500,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "can_card_platinum",
      "bankId": "tangerine",
      "name": "TD Voyageur Visa",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 13000,
      "maxLimit": 78000,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 117000,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "aus": [
    {
      "id": "aus_card_classic",
      "bankId": "cba",
      "name": "CommBank Low Rate Visa",
      "tier": "classic",
      "minLimit": 3000,
      "maxLimit": 26250,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 37500,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "aus_card_gold",
      "bankId": "westpac",
      "name": "Westpac Visa Gold",
      "tier": "gold",
      "since": 1983,
      "minLimit": 7500,
      "maxLimit": 52500,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 67500,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "aus_card_platinum",
      "bankId": "ubank",
      "name": "ANZ Platinum Visa",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 15000,
      "maxLimit": 90000,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 135000,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "nld": [
    {
      "id": "nld_card_classic",
      "bankId": "ing_nl",
      "name": "Rabobank Visa Betaalpas",
      "tier": "classic",
      "minLimit": 1680,
      "maxLimit": 14700,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 21000,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "nld_card_gold",
      "bankId": "rabobank",
      "name": "ING Visa Gold",
      "tier": "gold",
      "since": 1983,
      "minLimit": 4200,
      "maxLimit": 29400,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 37800,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "nld_card_platinum",
      "bankId": "abn_amro",
      "name": "bunq Visa Platinum",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 8400,
      "maxLimit": 50400,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 75600,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "fra": [
    {
      "id": "fra_card_classic",
      "bankId": "bnpp",
      "name": "Carte Visa BNP Basique",
      "tier": "classic",
      "minLimit": 1560,
      "maxLimit": 13650,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 19500,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "fra_card_gold",
      "bankId": "socgen",
      "name": "Gold Visa Soci\u00e9t\u00e9 G\u00e9n\u00e9rale",
      "tier": "gold",
      "since": 1983,
      "minLimit": 3900,
      "maxLimit": 27300,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 35100,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "fra_card_platinum",
      "bankId": "boursobank",
      "name": "Hello One Platinum",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 7800,
      "maxLimit": 46800,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 70200,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "jpn": [
    {
      "id": "jpn_card_classic",
      "bankId": "mufg",
      "name": "\u4e09\u83f1UFJ\u30ab\u30fc\u30c9 Visa\u30af\u30e9\u30b7\u30c3\u30af",
      "tier": "classic",
      "minLimit": 180000,
      "maxLimit": 1575000,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 2250000,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "jpn_card_gold",
      "bankId": "smbc",
      "name": "\u4e09\u4e95\u4f4f\u53cb\u30ab\u30fc\u30c9 Gold",
      "tier": "gold",
      "since": 1983,
      "minLimit": 450000,
      "maxLimit": 3150000,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 4050000,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "jpn_card_platinum",
      "bankId": "rakuten_bank",
      "name": "\u697d\u5929\u30ab\u30fc\u30c9 Platinum",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 900000,
      "maxLimit": 5400000,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 8100000,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "ita": [
    {
      "id": "ita_card_classic",
      "bankId": "unicredit",
      "name": "CartaUniCredit a Costo Zero",
      "tier": "classic",
      "minLimit": 1200,
      "maxLimit": 10500,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 15000,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "ita_card_gold",
      "bankId": "isp",
      "name": "Hello Gold Intesa",
      "tier": "gold",
      "since": 1983,
      "minLimit": 3000,
      "maxLimit": 21000,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 27000,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "ita_card_platinum",
      "bankId": "fineco",
      "name": "American Express Platino",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 6000,
      "maxLimit": 36000,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 54000,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "sgp": [
    {
      "id": "sgp_card_classic",
      "bankId": "dbs",
      "name": "DBS EcoCard",
      "tier": "classic",
      "minLimit": 2800,
      "maxLimit": 24500,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 35000,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "sgp_card_gold",
      "bankId": "ocbc",
      "name": "OCBC 90\u00b0N Visa",
      "tier": "gold",
      "since": 1983,
      "minLimit": 7000,
      "maxLimit": 49000,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 63000,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "sgp_card_platinum",
      "bankId": "uob",
      "name": "UOB Visa Infinite",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 14000,
      "maxLimit": 84000,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 126000,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "bra": [
    {
      "id": "bra_card_classic",
      "bankId": "itau",
      "name": "Nubank Roxinho",
      "tier": "classic",
      "minLimit": 1920,
      "maxLimit": 16800,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 24000,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "bra_card_gold",
      "bankId": "bradesco",
      "name": "Itau Personnalite Gold",
      "tier": "gold",
      "since": 1983,
      "minLimit": 4800,
      "maxLimit": 33600,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 43200,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "bra_card_platinum",
      "bankId": "nubank",
      "name": "Bradesco Elo Nanquim",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 9600,
      "maxLimit": 57600,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 86400,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "ind": [
    {
      "id": "ind_card_classic",
      "bankId": "sbi",
      "name": "SBI Simple Card",
      "tier": "classic",
      "minLimit": 24000,
      "maxLimit": 210000,
      "apr": 0.16,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.01,
      "reqScore": 620,
      "reqIncome": 300000,
      "perks": [
        "No annual fee"
      ]
    },
    {
      "id": "ind_card_gold",
      "bankId": "hdfc",
      "name": "HDFC Millennia",
      "tier": "gold",
      "since": 1983,
      "minLimit": 60000,
      "maxLimit": 420000,
      "apr": 0.14,
      "minPaymentPct": 0.03,
      "cashbackRate": 0.02,
      "reqScore": 680,
      "reqIncome": 540000,
      "perks": [
        "Airport lounge",
        "Purchase protection"
      ]
    },
    {
      "id": "ind_card_platinum",
      "bankId": "icici",
      "name": "ICICI Sappiro",
      "tier": "platinum",
      "since": 1998,
      "minLimit": 120000,
      "maxLimit": 720000,
      "apr": 0.13,
      "minPaymentPct": 0.02,
      "cashbackRate": 0.03,
      "reqScore": 740,
      "reqIncome": 1080000,
      "perks": [
        "Concierge",
        "Travel insurance",
        " lounge access"
      ]
    }
  ],
  "che": [
    {
      "id": "ubs_classic",
      "bankId": "ubs",
      "name": "UBS Visa Classic",
      "tier": "classic",
      "minLimit": 1000,
      "maxLimit": 10000,
      "apr": 0.119,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 580,
      "reqIncome": 36000,
      "perks": ["No annual fee first year", "UBS key4 cashback"]
    },
    {
      "id": "zkb_gold",
      "bankId": "zkb",
      "name": "ZKB Visa Gold",
      "tier": "gold",
      "minLimit": 5000,
      "maxLimit": 30000,
      "apr": 0.119,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 580,
      "reqIncome": 60000,
      "perks": ["Travel insurance included", "Lounge access"]
    }
  ],
  "swe": [
    {
      "id": "seb_classic",
      "bankId": "seb",
      "name": "SEB Mastercard Classic",
      "tier": "classic",
      "minLimit": 5000,
      "maxLimit": 50000,
      "apr": 0.1395,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 580,
      "reqIncome": 180000,
      "perks": ["Interest-free period up to 50 days", "Travel insurance"]
    },
    {
      "id": "handelsbanken_gold",
      "bankId": "handelsbanken",
      "name": "Handelsbanken Mastercard Gold",
      "tier": "gold",
      "minLimit": 10000,
      "maxLimit": 100000,
      "apr": 0.1295,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 580,
      "reqIncome": 300000,
      "perks": ["Travel insurance included", "Purchase protection"]
    }
  ],
  "tur": [
    {
      "id": "garanti_bonus",
      "bankId": "garanti",
      "name": "Garanti BBVA Bonus Classic",
      "tier": "classic",
      "minLimit": 5000,
      "maxLimit": 200000,
      "apr": 0.45,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 580,
      "reqIncome": 300000,
      "perks": ["Bonus points on every spend", "Instalment plans at partner stores"]
    },
    {
      "id": "isbank_maximum_gold",
      "bankId": "isbank",
      "name": "İşbank Maximum Gold",
      "tier": "gold",
      "minLimit": 10000,
      "maxLimit": 500000,
      "apr": 0.44,
      "minPaymentPct": 0.05,
      "cashbackRate": 0.01,
      "reqScore": 580,
      "reqIncome": 480000,
      "perks": ["Maximum points on every spend", "Airport lounge access"]
    }
  ]
};
export const V1_LOAN_PRODUCTS = {
  "egy": [
    {
      "id": "personal_cash",
      "name": "Unsecured Personal Cash Finance",
      "purpose": "general",
      "minAmount": 20000,
      "maxAmount": 1500000,
      "rate": 0.25,
      "minTerm": 1,
      "maxTerm": 8,
      "reqScore": 600,
      "reqIncome": 8000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "cbe_mortgage_subsidized",
      "name": "CBE Low/Middle Income Mortgage Initiative",
      "purpose": "mortgage",
      "minAmount": 100000,
      "maxAmount": 2500000,
      "rate": 0.08,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 620,
      "reqIncome": 10000,
      "requiresProperty": true,
      "requiresCar": false
    },
    {
      "id": "commercial_mortgage",
      "name": "Commercial Real Estate Mortgage",
      "purpose": "mortgage",
      "minAmount": 500000,
      "maxAmount": 15000000,
      "rate": 0.23,
      "minTerm": 5,
      "maxTerm": 15,
      "reqScore": 680,
      "reqIncome": 35000,
      "requiresProperty": true,
      "requiresCar": false
    },
    {
      "id": "auto_loan_standard",
      "name": "Auto Finance (New Car)",
      "purpose": "car",
      "minAmount": 100000,
      "maxAmount": 3000000,
      "rate": 0.22,
      "minTerm": 1,
      "maxTerm": 7,
      "reqScore": 610,
      "reqIncome": 12000,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "sme_business_loan",
      "name": "SME Commercial Expansion Loan",
      "purpose": "business",
      "minAmount": 250000,
      "maxAmount": 10000000,
      "rate": 0.05,
      "minTerm": 2,
      "maxTerm": 5,
      "reqScore": 700,
      "reqIncome": 50000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "doctor_clinic_loan",
      "name": "Medical Clinic & Equipment Finance",
      "purpose": "business",
      "minAmount": 100000,
      "maxAmount": 4000000,
      "rate": 0.18,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 650,
      "reqIncome": 20000,
      "requiresProperty": false,
      "requiresCar": false
    }
  ],
  "usa": [
    {
      "id": "personal_unsecured",
      "name": "Unsecured Personal Loan",
      "purpose": "general",
      "minAmount": 2000,
      "maxAmount": 50000,
      "rate": 0.105,
      "minTerm": 2,
      "maxTerm": 7,
      "reqScore": 650,
      "reqIncome": 30000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "fixed_30yr_mortgage",
      "name": "30-Year Fixed Conventional Mortgage",
      "purpose": "mortgage",
      "minAmount": 100000,
      "maxAmount": 750000,
      "rate": 0.066,
      "minTerm": 30,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 50000,
      "requiresProperty": true,
      "requiresCar": false
    },
    {
      "id": "jumbo_mortgage",
      "name": "Jumbo Luxury Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 750001,
      "maxAmount": 5000000,
      "rate": 0.071,
      "minTerm": 15,
      "maxTerm": 30,
      "reqScore": 740,
      "reqIncome": 180000,
      "requiresProperty": true,
      "requiresCar": false
    },
    {
      "id": "auto_loan_new",
      "name": "New Vehicle Purchase Loan",
      "purpose": "car",
      "minAmount": 10000,
      "maxAmount": 120000,
      "rate": 0.059,
      "minTerm": 3,
      "maxTerm": 6,
      "reqScore": 660,
      "reqIncome": 32000,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "sba_7a_loan",
      "name": "SBA 7(a) Small Business Finance",
      "purpose": "business",
      "minAmount": 50000,
      "maxAmount": 2000000,
      "rate": 0.095,
      "minTerm": 5,
      "maxTerm": 10,
      "reqScore": 700,
      "reqIncome": 75000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "federal_student_loan",
      "name": "Direct Subsidized Student Loan",
      "purpose": "student",
      "minAmount": 2500,
      "maxAmount": 60000,
      "rate": 0.055,
      "minTerm": 10,
      "maxTerm": 20,
      "reqScore": 550,
      "reqIncome": 0,
      "requiresProperty": false,
      "requiresCar": false
    }
  ],
  "sau": [
    {
      "id": "personal_tawarruq",
      "name": "Personal Finance (Tawarruq Sharia)",
      "purpose": "general",
      "minAmount": 20000,
      "maxAmount": 500000,
      "rate": 0.045,
      "minTerm": 1,
      "maxTerm": 5,
      "reqScore": 640,
      "reqIncome": 6000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "redf_subsidized_housing",
      "name": "REDF Subsidized Housing Murabaha",
      "purpose": "mortgage",
      "minAmount": 200000,
      "maxAmount": 3000000,
      "rate": 0.032,
      "minTerm": 15,
      "maxTerm": 25,
      "reqScore": 660,
      "reqIncome": 10000,
      "requiresProperty": true,
      "requiresCar": false
    },
    {
      "id": "auto_murabaha",
      "name": "Auto Murabaha Lease-to-Own",
      "purpose": "car",
      "minAmount": 30000,
      "maxAmount": 400000,
      "rate": 0.048,
      "minTerm": 2,
      "maxTerm": 5,
      "reqScore": 630,
      "reqIncome": 7000,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "monshaat_sme",
      "name": "Monsha\u2019at SME Development Finance",
      "purpose": "business",
      "minAmount": 100000,
      "maxAmount": 5000000,
      "rate": 0.04,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 690,
      "reqIncome": 30000,
      "requiresProperty": false,
      "requiresCar": false
    }
  ],
  "uae": [
    {
      "id": "personal_expat",
      "name": "Expat Personal Salary Transfer Loan",
      "purpose": "general",
      "minAmount": 15000,
      "maxAmount": 400000,
      "rate": 0.058,
      "minTerm": 1,
      "maxTerm": 4,
      "reqScore": 650,
      "reqIncome": 10000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "home_finance_expat",
      "name": "Residential Home Mortgage Finance",
      "purpose": "mortgage",
      "minAmount": 250000,
      "maxAmount": 10000000,
      "rate": 0.045,
      "minTerm": 10,
      "maxTerm": 25,
      "reqScore": 680,
      "reqIncome": 20000,
      "requiresProperty": true,
      "requiresCar": false
    },
    {
      "id": "auto_loan_uae",
      "name": "Comprehensive Auto Finance",
      "purpose": "car",
      "minAmount": 25000,
      "maxAmount": 600000,
      "rate": 0.042,
      "minTerm": 2,
      "maxTerm": 5,
      "reqScore": 640,
      "reqIncome": 10000,
      "requiresProperty": false,
      "requiresCar": true
    }
  ],
  "gbr": [
    {
      "id": "unsecured_personal_uk",
      "name": "Fixed Rate Personal Loan",
      "purpose": "general",
      "minAmount": 2000,
      "maxAmount": 35000,
      "rate": 0.068,
      "minTerm": 1,
      "maxTerm": 7,
      "reqScore": 660,
      "reqIncome": 18000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "residential_mortgage_uk",
      "name": "5-Year Fixed Rate Residential Mortgage",
      "purpose": "mortgage",
      "minAmount": 50000,
      "maxAmount": 1000000,
      "rate": 0.047,
      "minTerm": 15,
      "maxTerm": 35,
      "reqScore": 680,
      "reqIncome": 30000,
      "requiresProperty": true,
      "requiresCar": false
    },
    {
      "id": "pcp_car_finance",
      "name": "Personal Contract Purchase (PCP) Auto",
      "purpose": "car",
      "minAmount": 5000,
      "maxAmount": 80000,
      "rate": 0.062,
      "minTerm": 2,
      "maxTerm": 4,
      "reqScore": 650,
      "reqIncome": 20000,
      "requiresProperty": false,
      "requiresCar": true
    }
  ],
  "deu": [
    {
      "id": "deu_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 2250,
      "maxAmount": 36000,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 27000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "deu_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 9000,
      "maxAmount": 67500,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 31500,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "deu_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 135000,
      "maxAmount": 540000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 54000,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "can": [
    {
      "id": "can_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 3250,
      "maxAmount": 52000,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 39000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "can_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 13000,
      "maxAmount": 97500,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 45500,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "can_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 195000,
      "maxAmount": 780000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 78000,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "aus": [
    {
      "id": "aus_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 3750,
      "maxAmount": 60000,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 45000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "aus_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 15000,
      "maxAmount": 112500,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 52500,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "aus_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 225000,
      "maxAmount": 900000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 90000,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "nld": [
    {
      "id": "nld_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 2100,
      "maxAmount": 33600,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 25200,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "nld_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 8400,
      "maxAmount": 63000,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 29400,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "nld_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 126000,
      "maxAmount": 504000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 50400,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "fra": [
    {
      "id": "fra_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 1950,
      "maxAmount": 31200,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 23400,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "fra_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 7800,
      "maxAmount": 58500,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 27300,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "fra_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 117000,
      "maxAmount": 468000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 46800,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "jpn": [
    {
      "id": "jpn_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 225000,
      "maxAmount": 3600000,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 2700000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "jpn_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 900000,
      "maxAmount": 6750000,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 3150000,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "jpn_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 13500000,
      "maxAmount": 54000000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 5400000,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "ita": [
    {
      "id": "ita_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 1500,
      "maxAmount": 24000,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 18000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "ita_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 6000,
      "maxAmount": 45000,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 21000,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "ita_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 90000,
      "maxAmount": 360000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 36000,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "sgp": [
    {
      "id": "sgp_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 3500,
      "maxAmount": 56000,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 42000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "sgp_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 14000,
      "maxAmount": 105000,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 49000,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "sgp_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 210000,
      "maxAmount": 840000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 84000,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "bra": [
    {
      "id": "bra_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 2400,
      "maxAmount": 38400,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 28800,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "bra_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 9600,
      "maxAmount": 72000,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 33600,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "bra_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 144000,
      "maxAmount": 576000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 57600,
      "requiresProperty": true,
      "requiresCar": false
    }
  ],
  "ind": [
    {
      "id": "ind_loan_personal",
      "name": "Personal Loan",
      "purpose": "general",
      "minAmount": 30000,
      "maxAmount": 480000,
      "rate": 0.09,
      "minTerm": 2,
      "maxTerm": 6,
      "reqScore": 640,
      "reqIncome": 360000,
      "requiresProperty": false,
      "requiresCar": false
    },
    {
      "id": "ind_loan_auto",
      "name": "Auto Loan",
      "purpose": "auto",
      "minAmount": 120000,
      "maxAmount": 900000,
      "rate": 0.065,
      "minTerm": 3,
      "maxTerm": 7,
      "reqScore": 620,
      "reqIncome": 420000,
      "requiresProperty": false,
      "requiresCar": true
    },
    {
      "id": "ind_loan_mortgage",
      "name": "Home Mortgage",
      "purpose": "mortgage",
      "minAmount": 1800000,
      "maxAmount": 7200000,
      "rate": 0.04,
      "minTerm": 10,
      "maxTerm": 30,
      "reqScore": 680,
      "reqIncome": 720000,
      "requiresProperty": true,
      "requiresCar": false
    }
  ]
};
export const V1_DIGITAL_WALLETS = {
  "egy": [
    {
      "id": "vodafone_cash",
      "name": "Vodafone Cash",
      "provider": "Vodafone Egypt",
      "fees": 0,
      "monthlyLimit": 30000,
      "transferFee": 0.005,
      "userBase": "18M+ users"
    },
    {
      "id": "instapay",
      "name": "InstaPay",
      "provider": "Central Bank of Egypt",
      "fees": 0,
      "monthlyLimit": 200000,
      "transferFee": 0,
      "userBase": "All Egyptian banks"
    },
    {
      "id": "fawry",
      "name": "Fawry Wallet",
      "provider": "Fawry",
      "fees": 0,
      "monthlyLimit": 20000,
      "transferFee": 0.005,
      "userBase": "Bill payments everywhere"
    },
    {
      "id": "valu",
      "name": "valU",
      "provider": "EFG Hermes",
      "fees": 0,
      "monthlyLimit": 200000,
      "transferFee": 0,
      "userBase": "BNPL everywhere"
    },
    {
      "id": "mnt_halan",
      "name": "MNT-Halan",
      "provider": "MNT-Halan",
      "fees": 0,
      "monthlyLimit": 50000,
      "transferFee": 0.003,
      "userBase": "Rural users"
    },
    {
      "id": "telda_wallet",
      "name": "Telda",
      "provider": "Telda",
      "fees": 0,
      "monthlyLimit": 100000,
      "transferFee": 0,
      "userBase": "Neobank"
    }
  ],
  "usa": [
    {
      "id": "venmo",
      "name": "Venmo",
      "provider": "PayPal",
      "fees": 0,
      "transferFee": 0.0175
    },
    {
      "id": "cashapp",
      "name": "Cash App",
      "provider": "Block Inc",
      "fees": 0,
      "transferFee": 0.0175
    },
    {
      "id": "zelle",
      "name": "Zelle",
      "provider": "Bank consortium",
      "fees": 0,
      "transferFee": 0
    },
    {
      "id": "apple_pay",
      "name": "Apple Pay",
      "provider": "Apple",
      "fees": 0,
      "transferFee": 0
    },
    {
      "id": "google_pay",
      "name": "Google Pay",
      "provider": "Google",
      "fees": 0,
      "transferFee": 0
    }
  ],
  "sau": [
    {
      "id": "stc_pay",
      "name": "STC Pay",
      "provider": "STC",
      "fees": 0,
      "transferFee": 0
    },
    {
      "id": "apple_pay_sa",
      "name": "Apple Pay",
      "provider": "Apple",
      "fees": 0,
      "transferFee": 0
    },
    {
      "id": "mada_pay",
      "name": "mada Pay",
      "provider": "Saudi Payments",
      "fees": 0,
      "transferFee": 0
    }
  ],
  "uae": [
    {
      "id": "careem_pay",
      "name": "Careem Pay",
      "provider": "Careem",
      "fees": 0,
      "transferFee": 0
    },
    {
      "id": "eand_money",
      "name": "e& money",
      "provider": "e& (Etisalat)",
      "fees": 0,
      "transferFee": 0
    }
  ],
  "gbr": [
    {
      "id": "monzo_wallet",
      "name": "Monzo",
      "provider": "Monzo Bank",
      "fees": 0,
      "transferFee": 0
    },
    {
      "id": "revolut",
      "name": "Revolut",
      "provider": "Revolut",
      "fees": 0,
      "transferFee": 0,
      "multiCurrency": true
    },
    {
      "id": "wise",
      "name": "Wise",
      "provider": "Wise",
      "fees": 0,
      "transferFee": 0.0041,
      "multiCurrency": true
    }
  ],
  "deu": [
    {
      "id": "deu_n26",
      "name": "N26",
      "provider": "N26",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2013
    },
    {
      "id": "deu_paypal",
      "name": "PayPal",
      "provider": "PayPal",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 1998
    },
    {
      "id": "deu_payback",
      "name": "PAYBACK Pay",
      "provider": "PAYBACK",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2019
    }
  ],
  "can": [
    {
      "id": "can_interac",
      "name": "Interac e-Transfer",
      "provider": "Payments Canada",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2009
    },
    {
      "id": "can_coinswap",
      "name": "Coinswap",
      "provider": "Coinswap",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2013
    }
  ],
  "aus": [
    {
      "id": "aus_payid",
      "name": "payID",
      "provider": "NPP",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2018
    },
    {
      "id": "aus_afterpay",
      "name": "Afterpay",
      "provider": "Afterpay",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2014
    }
  ],
  "nld": [
    {
      "id": "nld_ideal",
      "name": "iDEAL",
      "provider": "Currence",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2005
    },
    {
      "id": "nld_bunq",
      "name": "bunq Wallet",
      "provider": "bunq",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2012
    }
  ],
  "fra": [
    {
      "id": "fra_paylib",
      "name": "Paylib",
      "provider": "Paylib",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2017
    },
    {
      "id": "fra_lydia",
      "name": "Lydia",
      "provider": "Linxo",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2011
    }
  ],
  "jpn": [
    {
      "id": "jpn_paypay",
      "name": "PayPay",
      "provider": "PayPay",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2018
    },
    {
      "id": "jpn_linepay",
      "name": "LINE Pay",
      "provider": "LINE",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2014
    }
  ],
  "ita": [
    {
      "id": "ita_paypal",
      "name": "PayPal",
      "provider": "PayPal",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 1998
    },
    {
      "id": "ita_satispay",
      "name": "Satispay",
      "provider": "Satispay",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2013
    }
  ],
  "sgp": [
    {
      "id": "sgp_paynow",
      "name": "PayLah! / PayNow",
      "provider": "DBS",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2017
    },
    {
      "id": "sgp_gcash",
      "name": "GrabPay",
      "provider": "Grab",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2016
    }
  ],
  "bra": [
    {
      "id": "bra_pix",
      "name": "PicPay",
      "provider": "PicPay",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2012
    },
    {
      "id": "bra_nubank",
      "name": "Nubank Conta",
      "provider": "Nubank",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2013
    }
  ],
  "ind": [
    {
      "id": "ind_paytm",
      "name": "Paytm",
      "provider": "Paytm",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2010
    },
    {
      "id": "ind_phonepe",
      "name": "PhonePe",
      "provider": "PhonePe",
      "fees": 0,
      "transferFee": 0.01,
      "launchYear": 2015
    }
  ]
};
export const V1_GOV_BONDS = {
  "egy": [
    {
      "id": "tbill_91d",
      "name": "91-Day Treasury Bill",
      "yield": 0.275,
      "minAmount": 5000,
      "termDays": 91,
      "risk": "sovereign"
    },
    {
      "id": "tbill_182d",
      "name": "182-Day Treasury Bill",
      "yield": 0.265,
      "minAmount": 5000,
      "termDays": 182,
      "risk": "sovereign"
    },
    {
      "id": "tbill_364d",
      "name": "364-Day Treasury Bill",
      "yield": 0.245,
      "minAmount": 5000,
      "termDays": 364,
      "risk": "sovereign"
    },
    {
      "id": "bond_3yr",
      "name": "3-Year Treasury Bond",
      "yield": 0.235,
      "minAmount": 10000,
      "termDays": 1095,
      "risk": "sovereign"
    },
    {
      "id": "bond_5yr",
      "name": "5-Year Treasury Bond",
      "yield": 0.22,
      "minAmount": 10000,
      "termDays": 1825,
      "risk": "sovereign"
    },
    {
      "id": "bond_10yr",
      "name": "10-Year Treasury Bond",
      "yield": 0.195,
      "minAmount": 10000,
      "termDays": 3650,
      "risk": "sovereign"
    }
  ],
  "usa": [
    {
      "id": "tbill_4w",
      "name": "4-Week T-Bill",
      "yield": 0.043,
      "minAmount": 100,
      "termDays": 28,
      "risk": "sovereign"
    },
    {
      "id": "tbill_13w",
      "name": "13-Week T-Bill",
      "yield": 0.0445,
      "minAmount": 100,
      "termDays": 91,
      "risk": "sovereign"
    },
    {
      "id": "tbill_26w",
      "name": "26-Week T-Bill",
      "yield": 0.0435,
      "minAmount": 100,
      "termDays": 182,
      "risk": "sovereign"
    },
    {
      "id": "tnote_2yr",
      "name": "2-Year T-Note",
      "yield": 0.042,
      "minAmount": 100,
      "termDays": 730,
      "risk": "sovereign"
    },
    {
      "id": "tnote_5yr",
      "name": "5-Year T-Note",
      "yield": 0.043,
      "minAmount": 100,
      "termDays": 1825,
      "risk": "sovereign"
    },
    {
      "id": "tnote_10yr",
      "name": "10-Year T-Note",
      "yield": 0.0445,
      "minAmount": 100,
      "termDays": 3650,
      "risk": "sovereign"
    }
  ],
  "sau": [
    {
      "id": "sukuk_5yr",
      "name": "Saudi Government Sukuk (5-Year)",
      "yield": 0.048,
      "minAmount": 1000,
      "termDays": 1825,
      "risk": "sovereign"
    },
    {
      "id": "sukuk_10yr",
      "name": "Saudi Government Sukuk (10-Year)",
      "yield": 0.051,
      "minAmount": 1000,
      "termDays": 3650,
      "risk": "sovereign"
    }
  ],
  "uae": [
    {
      "id": "mbill_1yr",
      "name": "UAE M-Bill 1-Year",
      "yield": 0.048,
      "minAmount": 5000,
      "termDays": 365,
      "risk": "sovereign"
    },
    {
      "id": "bond_5yr",
      "name": "UAE Federal Bond 5-Year",
      "yield": 0.045,
      "minAmount": 5000,
      "termDays": 1825,
      "risk": "sovereign"
    }
  ],
  "gbr": [
    {
      "id": "gilt_1yr",
      "name": "UK Gilt 1-Year",
      "yield": 0.048,
      "minAmount": 100,
      "termDays": 365,
      "risk": "sovereign"
    },
    {
      "id": "gilt_5yr",
      "name": "UK Gilt 5-Year",
      "yield": 0.042,
      "minAmount": 100,
      "termDays": 1825,
      "risk": "sovereign"
    },
    {
      "id": "gilt_10yr",
      "name": "UK Gilt 10-Year",
      "yield": 0.043,
      "minAmount": 100,
      "termDays": 3650,
      "risk": "sovereign"
    }
  ],
  "deu": [
    {
      "id": "deu_bond_10y",
      "name": "Deutsche Bundesbank Bund (10Y)",
      "yield": 0.03,
      "minAmount": 4500,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "deu_bond_bill",
      "name": "EUR Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 2250,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "can": [
    {
      "id": "can_bond_10y",
      "name": "Government of Canada Bond (10Y)",
      "yield": 0.03,
      "minAmount": 6500,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "can_bond_bill",
      "name": "CAD Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 3250,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "aus": [
    {
      "id": "aus_bond_10y",
      "name": "Australian Government Bond (10Y)",
      "yield": 0.03,
      "minAmount": 7500,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "aus_bond_bill",
      "name": "AUD Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 3750,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "nld": [
    {
      "id": "nld_bond_10y",
      "name": "Staatsonderneming (NL 10Y)",
      "yield": 0.03,
      "minAmount": 4200,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "nld_bond_bill",
      "name": "EUR Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 2100,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "fra": [
    {
      "id": "fra_bond_10y",
      "name": "OAT France (10Y)",
      "yield": 0.03,
      "minAmount": 3900,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "fra_bond_bill",
      "name": "EUR Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 1950,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "jpn": [
    {
      "id": "jpn_bond_10y",
      "name": "\u65e5\u672c\u56fd\u50b5 (JGB 10Y)",
      "yield": 0.03,
      "minAmount": 450000,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "jpn_bond_bill",
      "name": "JPY Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 225000,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "ita": [
    {
      "id": "ita_bond_10y",
      "name": "BTP Italia (10Y)",
      "yield": 0.03,
      "minAmount": 3000,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "ita_bond_bill",
      "name": "EUR Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 1500,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "sgp": [
    {
      "id": "sgp_bond_10y",
      "name": "Singapore Government Securities (10Y)",
      "yield": 0.03,
      "minAmount": 7000,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "sgp_bond_bill",
      "name": "SGD Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 3500,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "bra": [
    {
      "id": "bra_bond_10y",
      "name": "Tesouro Selic (Brasil 5Y)",
      "yield": 0.03,
      "minAmount": 4800,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "bra_bond_bill",
      "name": "BRL Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 2400,
      "termDays": 90,
      "risk": "sovereign"
    }
  ],
  "ind": [
    {
      "id": "ind_bond_10y",
      "name": "Government of India G-Sec (10Y)",
      "yield": 0.03,
      "minAmount": 60000,
      "termDays": 3650,
      "risk": "sovereign"
    },
    {
      "id": "ind_bond_bill",
      "name": "INR Treasury Bill (90D)",
      "yield": 0.025,
      "minAmount": 30000,
      "termDays": 90,
      "risk": "sovereign"
    }
  ]
};
export const V1_INVESTMENT_PRODUCTS = {
  "egy": [
    {
      "id": "egx30_index",
      "name": "EGX 30 Index Fund (estimated)",
      "provider": "Egyptian Exchange-tracking product",
      "expectedReturn": 0.22,
      "volatility": 0.28,
      "minInvestment": 5000,
      "launchYear": 2015,
      "risk": "high"
    },
    {
      "id": "beltone_growth",
      "name": "Beltone Growth Equity Fund (estimated)",
      "provider": "Beltone",
      "expectedReturn": 0.25,
      "volatility": 0.3,
      "minInvestment": 50000,
      "launchYear": 2002,
      "risk": "high"
    },
    {
      "id": "efg_hermes_fund",
      "name": "EFG Hermes Money Market Fund (estimated)",
      "provider": "EFG Hermes",
      "expectedReturn": 0.225,
      "volatility": 0.02,
      "minInvestment": 10000,
      "launchYear": 1996,
      "risk": "low"
    },
    {
      "id": "ci_capital_bond",
      "name": "CI Capital Bond Fund (estimated)",
      "provider": "CI Capital",
      "expectedReturn": 0.19,
      "volatility": 0.05,
      "minInvestment": 25000,
      "launchYear": 2005,
      "risk": "low"
    },
    {
      "id": "azimut_equity",
      "name": "Azimut Egypt Equity Fund (estimated)",
      "provider": "Azimut Egypt",
      "expectedReturn": 0.24,
      "volatility": 0.26,
      "minInvestment": 25000,
      "launchYear": 2021,
      "risk": "high"
    },
    {
      "id": "tadawul_gold",
      "name": "AZ-Gold Precious Metals Fund (estimated)",
      "provider": "Azimut Egypt / Evolve",
      "expectedReturn": 0.15,
      "volatility": 0.12,
      "minInvestment": 10,
      "minInvestmentBasisYear": 2023,
      "launchYear": 2023,
      "risk": "medium"
    },
    {
      "id": "sabayek_gold",
      "name": "Beltone Evolve Gold Fund Sabayek (estimated)",
      "provider": "Beltone Asset Management / Evolve",
      "expectedReturn": 0.15,
      "volatility": 0.12,
      "minInvestment": 1000,
      "minInvestmentBasisYear": 2024,
      "launchYear": 2024,
      "risk": "medium"
    }
  ],
  "usa": [
    {
      "id": "vanguard_sp500",
      "name": "Vanguard S&P 500 ETF (VOO)",
      "provider": "Vanguard",
      "expectedReturn": 0.1,
      "volatility": 0.16,
      "minInvestment": 0,
      "risk": "medium"
    },
    {
      "id": "vti_total",
      "name": "Vanguard Total Stock Market (VTI)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.15,
      "minInvestment": 0,
      "risk": "medium"
    },
    {
      "id": "qqq_nasdaq",
      "name": "Invesco QQQ Nasdaq 100",
      "provider": "Invesco",
      "expectedReturn": 0.12,
      "volatility": 0.22,
      "minInvestment": 0,
      "risk": "high"
    },
    {
      "id": "bond_agg",
      "name": "iShares Core US Aggregate Bond (AGG)",
      "provider": "BlackRock",
      "expectedReturn": 0.045,
      "volatility": 0.05,
      "minInvestment": 0,
      "risk": "low"
    },
    {
      "id": "schwab_target_2055",
      "name": "Schwab Target 2055 Index Fund",
      "provider": "Schwab",
      "expectedReturn": 0.08,
      "volatility": 0.14,
      "minInvestment": 0,
      "launchYear": 2016,
      "risk": "medium"
    },
    {
      "id": "gold_gld",
      "name": "SPDR Gold Shares (GLD)",
      "provider": "SPDR",
      "expectedReturn": 0.06,
      "volatility": 0.12,
      "minInvestment": 0,
      "risk": "medium"
    }
  ],
  "sau": [
    {
      "id": "tadawul_index",
      "name": "Tadawul All-Share Benchmark Fund (estimated)",
      "provider": "Riyad Capital \u00b7 estimated product",
      "expectedReturn": 0.11,
      "volatility": 0.2,
      "minInvestment": 10000,
      "risk": "high",
      "launchYear": 2008
    },
    {
      "id": "snb_income",
      "name": "SNB Income Fund",
      "provider": "SNB",
      "expectedReturn": 0.06,
      "volatility": 0.04,
      "minInvestment": 50000,
      "risk": "low"
    },
    {
      "id": "b_saudi_equity",
      "name": "Saudi Equity Growth Fund",
      "provider": "Al Rajhi",
      "expectedReturn": 0.1,
      "volatility": 0.18,
      "minInvestment": 25000,
      "risk": "medium"
    }
  ],
  "uae": [
    {
      "id": "dfm_index",
      "name": "Dubai Financial Market Benchmark Fund (estimated)",
      "provider": "Emirates NBD \u00b7 estimated product",
      "expectedReturn": 0.12,
      "volatility": 0.2,
      "minInvestment": 10000,
      "risk": "high",
      "launchYear": 2008
    },
    {
      "id": "adx_index",
      "name": "Abu Dhabi Exchange Benchmark Fund (estimated)",
      "provider": "FAB \u00b7 estimated product",
      "expectedReturn": 0.11,
      "volatility": 0.18,
      "minInvestment": 10000,
      "risk": "high",
      "launchYear": 2008
    },
    {
      "id": "global_equity",
      "name": "Global Equity Fund",
      "provider": "Mashreq",
      "expectedReturn": 0.09,
      "volatility": 0.15,
      "minInvestment": 25000,
      "risk": "medium"
    }
  ],
  "gbr": [
    {
      "id": "ftse_all_share",
      "name": "FTSE All-Share Index Fund",
      "provider": "Vanguard UK",
      "expectedReturn": 0.075,
      "volatility": 0.14,
      "minInvestment": 100,
      "risk": "medium"
    },
    {
      "id": "lifestrategy_60",
      "name": "Vanguard LifeStrategy 60% Equity",
      "provider": "Vanguard UK",
      "expectedReturn": 0.065,
      "volatility": 0.1,
      "minInvestment": 100,
      "risk": "medium"
    },
    {
      "id": "isa_cash",
      "name": "Cash ISA (tax-free savings)",
      "provider": "Multiple",
      "expectedReturn": 0.042,
      "volatility": 0,
      "minInvestment": 1,
      "risk": "none",
      "taxFree": true
    }
  ],
  "deu": [
    {
      "id": "deu_inv_etf",
      "name": "iShares DAX (DE) UCITS ETF",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 450,
      "risk": "medium"
    },
    {
      "id": "deu_inv_global",
      "name": "Vanguard FTSE All-World Accumulating",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 450,
      "risk": "medium"
    },
    {
      "id": "deu_inv_bond_fund",
      "name": "EUR Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 900,
      "risk": "low"
    }
  ],
  "can": [
    {
      "id": "can_inv_etf",
      "name": "iShares S&P/TSX 60 ETF (XIU)",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 650,
      "risk": "medium"
    },
    {
      "id": "can_inv_global",
      "name": "Vanguard S&P 500 (VEF)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 650,
      "risk": "medium"
    },
    {
      "id": "can_inv_bond_fund",
      "name": "CAD Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 1300,
      "risk": "low"
    }
  ],
  "aus": [
    {
      "id": "aus_inv_etf",
      "name": "Vanguard Australian Shares (VAS)",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 750,
      "risk": "medium"
    },
    {
      "id": "aus_inv_global",
      "name": "Betashares Nasdaq 100 (NDQ)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 750,
      "risk": "medium"
    },
    {
      "id": "aus_inv_bond_fund",
      "name": "AUD Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 1500,
      "risk": "low"
    }
  ],
  "nld": [
    {
      "id": "nld_inv_etf",
      "name": "iShares AEX (NL) ETF",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 420,
      "risk": "medium"
    },
    {
      "id": "nld_inv_global",
      "name": "Vanguard All-World (VWCE)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 420,
      "risk": "medium"
    },
    {
      "id": "nld_inv_bond_fund",
      "name": "EUR Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 840,
      "risk": "low"
    }
  ],
  "fra": [
    {
      "id": "fra_inv_etf",
      "name": "Amundi MSCI France ETF",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 390,
      "risk": "medium"
    },
    {
      "id": "fra_inv_global",
      "name": "Vanguard FTSE World (VWCE)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 390,
      "risk": "medium"
    },
    {
      "id": "fra_inv_bond_fund",
      "name": "EUR Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 780,
      "risk": "low"
    }
  ],
  "jpn": [
    {
      "id": "jpn_inv_etf",
      "name": "NEXT FUNDS Nikkei 225 ETF",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 45000,
      "risk": "medium"
    },
    {
      "id": "jpn_inv_global",
      "name": "eMAXIS Slim \u5168\u4e16\u754c\u682a\u5f0f (All-Country)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 45000,
      "risk": "medium"
    },
    {
      "id": "jpn_inv_bond_fund",
      "name": "JPY Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 90000,
      "risk": "low"
    }
  ],
  "ita": [
    {
      "id": "ita_inv_etf",
      "name": "iShares FTSE MIB (Milano) ETF",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 300,
      "risk": "medium"
    },
    {
      "id": "ita_inv_global",
      "name": "Vanguard All-World Accumulating",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 300,
      "risk": "medium"
    },
    {
      "id": "ita_inv_bond_fund",
      "name": "EUR Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 600,
      "risk": "low"
    }
  ],
  "sgp": [
    {
      "id": "sgp_inv_etf",
      "name": "SPDR STI ETF",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 700,
      "risk": "medium"
    },
    {
      "id": "sgp_inv_global",
      "name": "Nikko AM SRI Trackable (MSCI Global)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 700,
      "risk": "medium"
    },
    {
      "id": "sgp_inv_bond_fund",
      "name": "SGD Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 1400,
      "risk": "low"
    }
  ],
  "bra": [
    {
      "id": "bra_inv_etf",
      "name": "Iti BOVESPA (BOVA11)",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 480,
      "risk": "medium"
    },
    {
      "id": "bra_inv_global",
      "name": "Vista All-World (WRLD11)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 480,
      "risk": "medium"
    },
    {
      "id": "bra_inv_bond_fund",
      "name": "BRL Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 960,
      "risk": "low"
    }
  ],
  "ind": [
    {
      "id": "ind_inv_etf",
      "name": "Nippon India Nifty 50 BeES",
      "provider": "iShares/Amundi",
      "expectedReturn": 0.08,
      "volatility": 0.16,
      "minInvestment": 6000,
      "risk": "medium"
    },
    {
      "id": "ind_inv_global",
      "name": "Motilal Oswal Nasdaq 100 (MON100)",
      "provider": "Vanguard",
      "expectedReturn": 0.09,
      "volatility": 0.18,
      "minInvestment": 6000,
      "risk": "medium"
    },
    {
      "id": "ind_inv_bond_fund",
      "name": "INR Government Bond Fund",
      "provider": "Amundi",
      "expectedReturn": 0.03,
      "volatility": 0.05,
      "minInvestment": 12000,
      "risk": "low"
    }
  ]
};
export const V1_PENSION_PRODUCTS = {
  "egy": [
    {
      "id": "national_pension",
      "name": "National Social Insurance (\u0627\u0644\u0647\u064a\u0626\u0629 \u0627\u0644\u0642\u0648\u0645\u064a\u0629)",
      "provider": "Government",
      "contributionRate": 0.11,
      "employerRate": 0.1875,
      "retirementAge": 60,
      "expectedReturn": 0.09
    },
    {
      "id": "private_pension",
      "name": "Private Pension Fund",
      "provider": "Multiple banks",
      "contributionRate": 0.08,
      "employerRate": 0.04,
      "retirementAge": 60,
      "expectedReturn": 0.12
    }
  ],
  "usa": [
    {
      "id": "401k",
      "name": "401(k) Retirement Plan",
      "provider": "Employer",
      "contributionRate": 0.1,
      "employerMatch": 0.05,
      "retirementAge": 59.5,
      "expectedReturn": 0.08,
      "taxAdvantaged": true
    },
    {
      "id": "roth_ira",
      "name": "Roth IRA",
      "provider": "Fidelity / Schwab / Vanguard",
      "contributionRate": 0.06,
      "employerMatch": 0,
      "retirementAge": 59.5,
      "expectedReturn": 0.08,
      "taxAdvantaged": true,
      "annualLimit": 7000
    },
    {
      "id": "traditional_ira",
      "name": "Traditional IRA",
      "provider": "Fidelity / Schwab",
      "contributionRate": 0.06,
      "employerMatch": 0,
      "retirementAge": 59.5,
      "expectedReturn": 0.08,
      "taxAdvantaged": true,
      "annualLimit": 7000
    },
    {
      "id": "social_security",
      "name": "Social Security",
      "provider": "US Government",
      "contributionRate": 0.062,
      "employerRate": 0.062,
      "retirementAge": 67,
      "expectedReturn": 0.03
    }
  ],
  "sau": [
    {
      "id": "gosi",
      "name": "GOSI (General Organization for Social Insurance)",
      "provider": "Government",
      "contributionRate": 0.095,
      "employerRate": 0.115,
      "retirementAge": 60,
      "expectedReturn": 0.06
    }
  ],
  "uae": [
    {
      "id": "gpssa",
      "name": "GPSSA (for UAE nationals)",
      "provider": "Government",
      "contributionRate": 0.05,
      "employerRate": 0.125,
      "retirementAge": 60,
      "expectedReturn": 0.06
    },
    {
      "id": "dews",
      "name": "DIFC Employee Workplace Savings (DEWS)",
      "provider": "DIFC",
      "contributionRate": 0.055,
      "employerRate": 0.055,
      "retirementAge": 60,
      "expectedReturn": 0.07
    }
  ],
  "gbr": [
    {
      "id": "state_pension",
      "name": "UK State Pension",
      "provider": "Government",
      "contributionRate": 0.08,
      "employerRate": 0.138,
      "retirementAge": 66,
      "expectedReturn": 0.03
    },
    {
      "id": "workplace_pension",
      "name": "Workplace Auto-Enrollment Pension",
      "provider": "Multiple",
      "contributionRate": 0.05,
      "employerRate": 0.03,
      "retirementAge": 55,
      "expectedReturn": 0.07
    },
    {
      "id": "sipp",
      "name": "Self-Invested Personal Pension (SIPP)",
      "provider": "Multiple",
      "contributionRate": 0.2,
      "employerMatch": 0,
      "retirementAge": 55,
      "expectedReturn": 0.075,
      "taxAdvantaged": true
    }
  ],
  "deu": [
    {
      "id": "deu_pen_1",
      "name": "Riester-Rente",
      "provider": "DWS",
      "contributionRate": 0.06,
      "employerMatch": 0.04,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "deu_pen_2",
      "name": "Betriebliche Altersvorsorge",
      "provider": "Employer",
      "contributionRate": 0.05,
      "employerMatch": 0.02,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "can": [
    {
      "id": "can_pen_1",
      "name": "RRSP",
      "provider": "Employer",
      "contributionRate": 0.06,
      "employerMatch": 0.03,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "can_pen_2",
      "name": "TFSA",
      "provider": "Self-directed",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "aus": [
    {
      "id": "aus_pen_1",
      "name": "Superannuation",
      "provider": "AustralianSuper",
      "contributionRate": 0.06,
      "employerMatch": 0.115,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "aus_pen_2",
      "name": "First Home Super Saver",
      "provider": "ATO",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "nld": [
    {
      "id": "nld_pen_1",
      "name": "Zwitserleven Pensioen",
      "provider": "Zwitserleven",
      "contributionRate": 0.06,
      "employerMatch": 0.05,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "nld_pen_2",
      "name": "Pensioenpremie (employer)",
      "provider": "Employer",
      "contributionRate": 0.05,
      "employerMatch": 0.04,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "fra": [
    {
      "id": "fra_pen_1",
      "name": "PER (Plan d\u2019\u00c9pargne Retraite)",
      "provider": "Amundi",
      "contributionRate": 0.06,
      "employerMatch": 0.04,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "fra_pen_2",
      "name": "Assurance Vie",
      "provider": "Generali",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "jpn": [
    {
      "id": "jpn_pen_1",
      "name": "\u4f01\u696d\u578b\u78ba\u5b9a\u62e0\u51fa\u5e74\u91d1 (401K)",
      "provider": "Employer",
      "contributionRate": 0.06,
      "employerMatch": 0.05,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "jpn_pen_2",
      "name": "iDeCo",
      "provider": "Self-directed",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "ita": [
    {
      "id": "ita_pen_1",
      "name": "Fondo Pensioni Complementare",
      "provider": "COVIP",
      "contributionRate": 0.06,
      "employerMatch": 0.05,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "ita_pen_2",
      "name": "PIP (Piano Individuale)",
      "provider": "General\u0130",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "sgp": [
    {
      "id": "sgp_pen_1",
      "name": "CPF Retirement Account",
      "provider": "CPF Board",
      "contributionRate": 0.06,
      "employerMatch": 0.2,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "sgp_pen_2",
      "name": "Supplementary Retirement Scheme",
      "provider": "Self-directed",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "bra": [
    {
      "id": "bra_pen_1",
      "name": "Previd\u00eancia Privada",
      "provider": "Brasilprev",
      "contributionRate": 0.06,
      "employerMatch": 0.05,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "bra_pen_2",
      "name": "PGBL",
      "provider": "Porto Seguro",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ],
  "ind": [
    {
      "id": "ind_pen_1",
      "name": "EPF (Employees\u2019 Provident Fund)",
      "provider": "EPFO",
      "contributionRate": 0.06,
      "employerMatch": 0.12,
      "retirementAge": 62,
      "expectedReturn": 0.06,
      "taxAdvantaged": true
    },
    {
      "id": "ind_pen_2",
      "name": "National Pension System",
      "provider": "PFRDA",
      "contributionRate": 0.05,
      "employerMatch": 0,
      "retirementAge": 60,
      "expectedReturn": 0.055,
      "taxAdvantaged": true
    }
  ]
};
export const V1_WORLD_MARKETS = {
  "deu": {
    "anchor": "db",
    "second": "commerzbank",
    "direct": "ing_diba",
    "postal": "sparkasse",
    "cardNames": {
      "classic": "Deutsche Bank Visa Card",
      "gold": "Commerzbank Gold Karte",
      "platinum": "DKB Visa Platinum"
    },
    "bondName": "Deutsche Bundesbank Bund (10Y)",
    "etfName": "iShares DAX (DE) UCITS ETF",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "Riester-Rente",
      "provider": "DWS",
      "match": 0.04
    },
    "pension2": {
      "name": "Betriebliche Altersvorsorge",
      "provider": "Employer",
      "match": 0.02
    },
    "insHome": "Allianz Wohngeb\u00e4ude",
    "insLife": "LV 1871 Risikolebensversicherung",
    "insHealth": "TK Krankenzusatz",
    "wallets": [
      {
        "id": "deu_n26",
        "name": "N26",
        "provider": "N26",
        "launchYear": 2013
      },
      {
        "id": "deu_paypal",
        "name": "PayPal",
        "provider": "PayPal",
        "launchYear": 1998
      },
      {
        "id": "deu_payback",
        "name": "PAYBACK Pay",
        "provider": "PAYBACK",
        "launchYear": 2019
      }
    ],
    "goalName": "Notgroschen",
    "homeCurrency": "EUR"
  },
  "can": {
    "anchor": "rbc",
    "second": "td",
    "direct": "tangerine",
    "postal": "scotiabank",
    "cardNames": {
      "classic": "Scotiabank Value Visa",
      "gold": "RBC Visa Gold",
      "platinum": "TD Voyageur Visa"
    },
    "bondName": "Government of Canada Bond (10Y)",
    "etfName": "iShares S&P/TSX 60 ETF (XIU)",
    "globalName": "Vanguard S&P 500 (VEF)",
    "pension": {
      "name": "RRSP",
      "provider": "Employer",
      "match": 0.03
    },
    "pension2": {
      "name": "TFSA",
      "provider": "Self-directed",
      "match": 0
    },
    "insHome": "Intact Home Insurance",
    "insLife": "Manulife Term Life",
    "insHealth": "Sun Life Supplementary Health",
    "wallets": [
      {
        "id": "can_interac",
        "name": "Interac e-Transfer",
        "provider": "Payments Canada",
        "launchYear": 2009
      },
      {
        "id": "can_coinswap",
        "name": "Coinswap",
        "provider": "Coinswap",
        "launchYear": 2013
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "CAD"
  },
  "aus": {
    "anchor": "cba",
    "second": "westpac",
    "direct": "ubank",
    "postal": "anz",
    "cardNames": {
      "classic": "CommBank Low Rate Visa",
      "gold": "Westpac Visa Gold",
      "platinum": "ANZ Platinum Visa"
    },
    "bondName": "Australian Government Bond (10Y)",
    "etfName": "Vanguard Australian Shares (VAS)",
    "globalName": "Betashares Nasdaq 100 (NDQ)",
    "pension": {
      "name": "Superannuation",
      "provider": "AustralianSuper",
      "match": 0.115
    },
    "pension2": {
      "name": "First Home Super Saver",
      "provider": "ATO",
      "match": 0
    },
    "insHome": "NRMA Home Insurance",
    "insLife": " TAL Term Life",
    "insHealth": "Bupa Supplementary",
    "wallets": [
      {
        "id": "aus_payid",
        "name": "payID",
        "provider": "NPP",
        "launchYear": 2018
      },
      {
        "id": "aus_afterpay",
        "name": "Afterpay",
        "provider": "Afterpay",
        "launchYear": 2014
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "AUD"
  },
  "nld": {
    "anchor": "ing_nl",
    "second": "rabobank",
    "direct": "abn_amro",
    "postal": "sns_bank",
    "cardNames": {
      "classic": "Rabobank Visa Betaalpas",
      "gold": "ING Visa Gold",
      "platinum": "bunq Visa Platinum"
    },
    "bondName": "Staatsonderneming (NL 10Y)",
    "etfName": "iShares AEX (NL) ETF",
    "globalName": "Vanguard All-World (VWCE)",
    "pension": {
      "name": "Zwitserleven Pensioen",
      "provider": "Zwitserleven",
      "match": 0.05
    },
    "pension2": {
      "name": "Pensioenpremie (employer)",
      "provider": "Employer",
      "match": 0.04
    },
    "insHome": "Centraal Beheer Woonverzekering",
    "insLife": "Nationale-Nederlanden Overlijdensrisicoverzekering",
    "insHealth": "CZ Aanvullende Zorg",
    "wallets": [
      {
        "id": "nld_ideal",
        "name": "iDEAL",
        "provider": "Currence",
        "launchYear": 2005
      },
      {
        "id": "nld_bunq",
        "name": "bunq Wallet",
        "provider": "bunq",
        "launchYear": 2012
      }
    ],
    "goalName": "Noodbuffer",
    "homeCurrency": "EUR"
  },
  "fra": {
    "anchor": "bnpp",
    "second": "socgen",
    "direct": "boursobank",
    "postal": "bpce",
    "cardNames": {
      "classic": "Carte Visa BNP Basique",
      "gold": "Gold Visa Soci\u00e9t\u00e9 G\u00e9n\u00e9rale",
      "platinum": "Hello One Platinum"
    },
    "bondName": "OAT France (10Y)",
    "etfName": "Amundi MSCI France ETF",
    "globalName": "Vanguard FTSE World (VWCE)",
    "pension": {
      "name": "PER (Plan d\u2019\u00c9pargne Retraite)",
      "provider": "Amundi",
      "match": 0.04
    },
    "pension2": {
      "name": "Assurance Vie",
      "provider": "Generali",
      "match": 0
    },
    "insHome": "AXA Habitation",
    "insLife": "CNP D\u00e9c\u00e8s",
    "insHealth": "Mutielle Sant\u00e9",
    "wallets": [
      {
        "id": "fra_paylib",
        "name": "Paylib",
        "provider": "Paylib",
        "launchYear": 2017
      },
      {
        "id": "fra_lydia",
        "name": "Lydia",
        "provider": "Linxo",
        "launchYear": 2011
      }
    ],
    "goalName": "\u00c9pargne de pr\u00e9caution",
    "homeCurrency": "EUR"
  },
  "jpn": {
    "anchor": "mufg",
    "second": "smbc",
    "direct": "rakuten_bank",
    "postal": "jp_post",
    "cardNames": {
      "classic": "\u4e09\u83f1UFJ\u30ab\u30fc\u30c9 Visa\u30af\u30e9\u30b7\u30c3\u30af",
      "gold": "\u4e09\u4e95\u4f4f\u53cb\u30ab\u30fc\u30c9 Gold",
      "platinum": "\u697d\u5929\u30ab\u30fc\u30c9 Platinum"
    },
    "bondName": "\u65e5\u672c\u56fd\u50b5 (JGB 10Y)",
    "etfName": "NEXT FUNDS Nikkei 225 ETF",
    "globalName": "eMAXIS Slim \u5168\u4e16\u754c\u682a\u5f0f (All-Country)",
    "pension": {
      "name": "\u4f01\u696d\u578b\u78ba\u5b9a\u62e0\u51fa\u5e74\u91d1 (401K)",
      "provider": "Employer",
      "match": 0.05
    },
    "pension2": {
      "name": "iDeCo",
      "provider": "Self-directed",
      "match": 0
    },
    "insHome": "sompo \u706b\u707d\u4fdd\u967a",
    "insLife": "\u751f\u547d\u4fdd\u967a \u5b9a\u671f\u4fdd\u967a",
    "insHealth": "\u30e1\u30c7\u30a3\u30ab\u30eb\u4fdd\u967a",
    "wallets": [
      {
        "id": "jpn_paypay",
        "name": "PayPay",
        "provider": "PayPay",
        "launchYear": 2018
      },
      {
        "id": "jpn_linepay",
        "name": "LINE Pay",
        "provider": "LINE",
        "launchYear": 2014
      }
    ],
    "goalName": "\u975e\u5e38\u7528\u8cc7\u91d1",
    "homeCurrency": "JPY"
  },
  "ita": {
    "anchor": "unicredit",
    "second": "isp",
    "direct": "fineco",
    "postal": "cdp",
    "cardNames": {
      "classic": "CartaUniCredit a Costo Zero",
      "gold": "Hello Gold Intesa",
      "platinum": "American Express Platino"
    },
    "bondName": "BTP Italia (10Y)",
    "etfName": "iShares FTSE MIB (Milano) ETF",
    "globalName": "Vanguard All-World Accumulating",
    "pension": {
      "name": "Fondo Pensioni Complementare",
      "provider": "COVIP",
      "match": 0.05
    },
    "pension2": {
      "name": "PIP (Piano Individuale)",
      "provider": "General\u0130",
      "match": 0
    },
    "insHome": "Generali Casa",
    "insLife": "Intesa Vita",
    "insHealth": "UniSalute",
    "wallets": [
      {
        "id": "ita_paypal",
        "name": "PayPal",
        "provider": "PayPal",
        "launchYear": 1998
      },
      {
        "id": "ita_satispay",
        "name": "Satispay",
        "provider": "Satispay",
        "launchYear": 2013
      }
    ],
    "goalName": "Fondo Emergenze",
    "homeCurrency": "EUR"
  },
  "sgp": {
    "anchor": "dbs",
    "second": "ocbc",
    "direct": "uob",
    "postal": "scb_sgp",
    "cardNames": {
      "classic": "DBS EcoCard",
      "gold": "OCBC 90\u00b0N Visa",
      "platinum": "UOB Visa Infinite"
    },
    "bondName": "Singapore Government Securities (10Y)",
    "etfName": "SPDR STI ETF",
    "globalName": "Nikko AM SRI Trackable (MSCI Global)",
    "pension": {
      "name": "CPF Retirement Account",
      "provider": "CPF Board",
      "match": 0.2
    },
    "pension2": {
      "name": "Supplementary Retirement Scheme",
      "provider": "Self-directed",
      "match": 0
    },
    "insHome": "AIA Home Protection",
    "insLife": "Great Eastern Term Life",
    "insHealth": "Income Health Essentials",
    "wallets": [
      {
        "id": "sgp_paynow",
        "name": "PayLah! / PayNow",
        "provider": "DBS",
        "launchYear": 2017
      },
      {
        "id": "sgp_gcash",
        "name": "GrabPay",
        "provider": "Grab",
        "launchYear": 2016
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "SGD"
  },
  "bra": {
    "anchor": "itau",
    "second": "bradesco",
    "direct": "nubank",
    "postal": "bb",
    "cardNames": {
      "classic": "Nubank Roxinho",
      "gold": "Itau Personnalite Gold",
      "platinum": "Bradesco Elo Nanquim"
    },
    "bondName": "Tesouro Selic (Brasil 5Y)",
    "etfName": "Iti BOVESPA (BOVA11)",
    "globalName": "Vista All-World (WRLD11)",
    "pension": {
      "name": "Previd\u00eancia Privada",
      "provider": "Brasilprev",
      "match": 0.05
    },
    "pension2": {
      "name": "PGBL",
      "provider": "Porto Seguro",
      "match": 0
    },
    "insHome": "Porto Seguro Casa",
    "insLife": "SulAm\u00e9rica Vida",
    "insHealth": "Amil Sa\u00fade",
    "wallets": [
      {
        "id": "bra_pix",
        "name": "PicPay",
        "provider": "PicPay",
        "launchYear": 2012
      },
      {
        "id": "bra_nubank",
        "name": "Nubank Conta",
        "provider": "Nubank",
        "launchYear": 2013
      }
    ],
    "goalName": "Reserva de Emerg\u00eancia",
    "homeCurrency": "BRL"
  },
  "ind": {
    "anchor": "sbi",
    "second": "hdfc",
    "direct": "icici",
    "postal": "kotak",
    "cardNames": {
      "classic": "SBI Simple Card",
      "gold": "HDFC Millennia",
      "platinum": "ICICI Sappiro"
    },
    "bondName": "Government of India G-Sec (10Y)",
    "etfName": "Nippon India Nifty 50 BeES",
    "globalName": "Motilal Oswal Nasdaq 100 (MON100)",
    "pension": {
      "name": "EPF (Employees\u2019 Provident Fund)",
      "provider": "EPFO",
      "match": 0.12
    },
    "pension2": {
      "name": "National Pension System",
      "provider": "PFRDA",
      "match": 0
    },
    "insHome": "HDFC Ergo Home",
    "insLife": "LIC Tech Term",
    "insHealth": "Star Health",
    "wallets": [
      {
        "id": "ind_paytm",
        "name": "Paytm",
        "provider": "Paytm",
        "launchYear": 2010
      },
      {
        "id": "ind_phonepe",
        "name": "PhonePe",
        "provider": "PhonePe",
        "launchYear": 2015
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "INR"
  },
  "che": {
    "anchor": "ubs",
    "second": "zkb",
    "direct": "postfinance",
    "postal": "postfinance",
    "cardNames": {
      "classic": "UBS Visa Classic",
      "gold": "Julius Baer Gold Card",
      "platinum": "Pictet Platinum Card"
    },
    "bondName": "Swiss Confederation Bond (10Y)",
    "etfName": "iShares SMI ETF (CH)",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "Pillar 3a",
      "provider": "UBS",
      "match": 0
    },
    "pension2": {
      "name": "Occupational Pension (BVG)",
      "provider": "Employer",
      "match": 0.05
    },
    "insHome": "AXA Switzerland Home",
    "insLife": "Swiss Life",
    "insHealth": "CSS Krankenversicherung Zusatz",
    "wallets": [
      {
        "id": "che_twint",
        "name": "TWINT",
        "provider": "TWINT",
        "launchYear": 2016
      },
      {
        "id": "che_paypal",
        "name": "PayPal",
        "provider": "PayPal",
        "launchYear": 1998
      }
    ],
    "goalName": "Notgroschen",
    "homeCurrency": "CHF"
  },
  "swe": {
    "anchor": "seb",
    "second": "handelsbanken",
    "direct": "sbab",
    "postal": "swedbank",
    "cardNames": {
      "classic": "SEB Mastercard Classic",
      "gold": "Handelsbanken Mastercard Gold",
      "platinum": "Nordea Platinum"
    },
    "bondName": "Swedish Government Bond (10Y)",
    "etfName": "XACT OMXS30 ETF",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "Tjänstepension ITP",
      "provider": "Alecta",
      "match": 0.045
    },
    "pension2": {
      "name": "Allmän pension (state)",
      "provider": "Pensionsmyndigheten",
      "match": 0
    },
    "insHome": "Länsförsäkringar Hemförsäkring",
    "insLife": "Folksam Liv",
    "insHealth": "Skandia Hälsa",
    "wallets": [
      {
        "id": "swe_swish",
        "name": "Swish",
        "provider": "Swish",
        "launchYear": 2012
      },
      {
        "id": "swe_paypal",
        "name": "PayPal",
        "provider": "PayPal",
        "launchYear": 1998
      }
    ],
    "goalName": "Buffert",
    "homeCurrency": "SEK"
  },
  "tur": {
    "anchor": "ziraat",
    "second": "isbank",
    "direct": "garanti",
    "postal": "ziraat",
    "cardNames": {
      "classic": "Garanti BBVA Bonus Classic",
      "gold": "İşbank Maximum Gold",
      "platinum": "Akbank Axess Platinum"
    },
    "bondName": "Turkish Government Bond (10Y)",
    "etfName": "BIST 100 ETF",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "BES (Bireysel Emeklilik)",
      "provider": "Allianz Türkiye",
      "match": 0.30
    },
    "pension2": {
      "name": "SGK (state pension)",
      "provider": "SGK",
      "match": 0
    },
    "insHome": "Anadolu Sigorta Konut",
    "insLife": "Anadolu Hayat Emeklilik",
    "insHealth": "Acıbadem Sigorta Sağlık",
    "wallets": [
      {
        "id": "tur_papara",
        "name": "Papara",
        "provider": "Papara",
        "launchYear": 2016
      },
      {
        "id": "tur_bkm",
        "name": "BKM Express",
        "provider": "BKM",
        "launchYear": 2012
      }
    ],
    "goalName": "Birikim",
    "homeCurrency": "TRY"
  },
  "egy":   {
    "anchor": "nbe",
    "second": "cib",
    "direct": "telda",
    "postal": "banque_misr",
    "cardNames": {
      "classic": "NBE Classic Visa",
      "gold": "CIB Titanium Mastercard",
      "platinum": "QNB Alahli Platinum"
    },
    "bondName": "Egyptian Treasury Bills (1Y)",
    "etfName": "EGX 30 ETF",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "Social Insurance (Ta'meenat)",
      "provider": "NOSI",
      "match": 0
    },
    "pension2": {
      "name": "Private Pension Plan",
      "provider": "Misr Life Insurance",
      "match": 0
    },
    "insHome": "Misr Insurance Home",
    "insLife": "Misr Life Insurance",
    "insHealth": "Allianz Egypt Health",
    "wallets": [
      {
        "id": "egy_instapay",
        "name": "InstaPay",
        "provider": "InstaPay",
        "launchYear": 2022
      },
      {
        "id": "egy_vodafone_cash",
        "name": "Vodafone Cash",
        "provider": "Vodafone",
        "launchYear": 2013
      },
      {
        "id": "egy_paypal",
        "name": "PayPal",
        "provider": "PayPal",
        "launchYear": 1998
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "EGP"
  },
  "usa":   {
    "anchor": "chase",
    "second": "bofa",
    "direct": "ally",
    "postal": "schwab",
    "cardNames": {
      "classic": "Chase Freedom Unlimited",
      "gold": "Capital One Venture",
      "platinum": "American Express Platinum"
    },
    "bondName": "US Treasury Note (10Y)",
    "etfName": "Vanguard S&P 500 ETF (VOO)",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "401(k)",
      "provider": "Fidelity",
      "match": 0.05
    },
    "pension2": {
      "name": "Roth IRA",
      "provider": "Vanguard",
      "match": 0
    },
    "insHome": "State Farm Homeowners",
    "insLife": "Northwestern Mutual Term Life",
    "insHealth": "Blue Cross Blue Shield",
    "wallets": [
      {
        "id": "usa_apple_pay",
        "name": "Apple Pay",
        "provider": "Apple",
        "launchYear": 2014
      },
      {
        "id": "usa_paypal",
        "name": "PayPal",
        "provider": "PayPal",
        "launchYear": 1998
      },
      {
        "id": "usa_venmo",
        "name": "Venmo",
        "provider": "Venmo",
        "launchYear": 2009
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "USD"
  },
  "sau":   {
    "anchor": "snb",
    "second": "al_rajhi",
    "direct": "stc_bank",
    "postal": "riyad",
    "cardNames": {
      "classic": "SNB Visa Classic",
      "gold": "Al Rajhi Visa Gold",
      "platinum": "SABB Platinum"
    },
    "bondName": "Saudi Government Sukuk",
    "etfName": "Tadawul TASI ETF",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "GOSI Pension",
      "provider": "GOSI",
      "match": 0
    },
    "pension2": {
      "name": "Private Retirement Plan",
      "provider": "Al Rajhi Takaful",
      "match": 0
    },
    "insHome": "Tawuniya Home",
    "insLife": "Tawuniya Life",
    "insHealth": "Bupa Arabia",
    "wallets": [
      {
        "id": "sau_stc_pay",
        "name": "STC Pay",
        "provider": "STC Pay",
        "launchYear": 2018
      },
      {
        "id": "sau_apple_pay",
        "name": "Apple Pay",
        "provider": "Apple",
        "launchYear": 2014
      },
      {
        "id": "sau_mada_pay",
        "name": "mada Pay",
        "provider": "mada",
        "launchYear": 2017
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "SAR"
  },
  "uae":   {
    "anchor": "emirates_nbd",
    "second": "fab",
    "direct": "wio",
    "postal": "adcb",
    "cardNames": {
      "classic": "Emirates NBD Visa Classic",
      "gold": "FAB Gold Mastercard",
      "platinum": "ADCB Platinum"
    },
    "bondName": "UAE Federal Bond",
    "etfName": "DFM General Index ETF",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "GPSSA Pension",
      "provider": "GPSSA",
      "match": 0
    },
    "pension2": {
      "name": "DEWS",
      "provider": "Zurich",
      "match": 0.05
    },
    "insHome": "AXA Home UAE",
    "insLife": "Zurich Life UAE",
    "insHealth": "Daman Health",
    "wallets": [
      {
        "id": "uae_apple_pay",
        "name": "Apple Pay",
        "provider": "Apple",
        "launchYear": 2014
      },
      {
        "id": "uae_samsung_pay",
        "name": "Samsung Pay",
        "provider": "Samsung",
        "launchYear": 2015
      },
      {
        "id": "uae_careem_pay",
        "name": "Careem Pay",
        "provider": "Careem",
        "launchYear": 2020
      }
    ],
    "goalName": "Emergency Fund",
    "homeCurrency": "AED"
  },
  "gbr":   {
    "anchor": "hsbc_uk",
    "second": "barclays",
    "direct": "monzo",
    "postal": "nationwide",
    "cardNames": {
      "classic": "HSBC Classic Credit Card",
      "gold": "Barclaycard Gold",
      "platinum": "Amex Platinum UK"
    },
    "bondName": "UK Gilt (10Y)",
    "etfName": "iShares FTSE 100 ETF",
    "globalName": "Vanguard FTSE All-World Accumulating",
    "pension": {
      "name": "Workplace Pension (NEST)",
      "provider": "NEST",
      "match": 0.03
    },
    "pension2": {
      "name": "SIPP",
      "provider": "Hargreaves Lansdown",
      "match": 0
    },
    "insHome": "Aviva Home Insurance",
    "insLife": "Legal & General Life",
    "insHealth": "Bupa Health",
    "wallets": [
      {
        "id": "gbr_apple_pay",
        "name": "Apple Pay",
        "provider": "Apple",
        "launchYear": 2014
      },
      {
        "id": "gbr_paypal",
        "name": "PayPal",
        "provider": "PayPal",
        "launchYear": 1998
      },
      {
        "id": "gbr_monzo",
        "name": "Monzo",
        "provider": "Monzo",
        "launchYear": 2015
      }
    ],
    "goalName": "Rainy Day Fund",
    "homeCurrency": "GBP"
  }
};
export const GLOBAL_MARKET_ASSETS = [
  {
    "id": "idx_sp500",
    "name": "S&P 500 US Index ETF (VOO)",
    "kind": "etf",
    "country": "usa",
    "meanReturn": 0.102,
    "volatility": 0.155,
    "dividendPct": 0.015,
    "shariaCompliant": false,
    "availableFrom": 1976
  },
  {
    "id": "idx_nasdaq100",
    "name": "NASDAQ-100 Tech ETF (QQQ)",
    "kind": "etf",
    "country": "usa",
    "meanReturn": 0.128,
    "volatility": 0.22,
    "dividendPct": 0.006,
    "shariaCompliant": false,
    "availableFrom": 1999
  },
  {
    "id": "idx_msci_world",
    "name": "MSCI World Developed Index",
    "kind": "etf",
    "country": "gbr",
    "meanReturn": 0.088,
    "volatility": 0.145,
    "dividendPct": 0.019,
    "shariaCompliant": false,
    "availableFrom": 1986
  },
  {
    "id": "idx_islamic_world",
    "name": "Dow Jones Islamic Market Titans ETF",
    "kind": "etf",
    "country": "sau",
    "meanReturn": 0.096,
    "volatility": 0.15,
    "dividendPct": 0.014,
    "shariaCompliant": true,
    "availableFrom": 1999
  },
  {
    "id": "idx_egx30",
    "name": "EGX 30 Cairo Blue-Chip Fund (CIB/TMG/Fawry)",
    "kind": "equity",
    "country": "egy",
    "meanReturn": 0.195,
    "volatility": 0.285,
    "dividendPct": 0.035,
    "shariaCompliant": false,
    "availableFrom": 1998
  },
  {
    "id": "idx_egx33_sharia",
    "name": "EGX 33 Shariah Compliant Index",
    "kind": "equity",
    "country": "egy",
    "meanReturn": 0.185,
    "volatility": 0.265,
    "dividendPct": 0.032,
    "shariaCompliant": true,
    "availableFrom": 2024
  },
  {
    "id": "idx_tasi",
    "name": "Tadawul All-Share Index (TASI)",
    "kind": "equity",
    "country": "sau",
    "meanReturn": 0.092,
    "volatility": 0.175,
    "dividendPct": 0.036,
    "shariaCompliant": true,
    "availableFrom": 1985
  },
  {
    "id": "stk_aramco",
    "name": "Saudi Aramco Equity (2222.SR)",
    "kind": "equity",
    "country": "sau",
    "meanReturn": 0.078,
    "volatility": 0.12,
    "dividendPct": 0.058,
    "shariaCompliant": true,
    "availableFrom": 2019
  },
  {
    "id": "stk_alrajhi",
    "name": "Al Rajhi Bank Shares (1120.SR)",
    "kind": "equity",
    "country": "sau",
    "meanReturn": 0.105,
    "volatility": 0.165,
    "dividendPct": 0.034,
    "shariaCompliant": true,
    "availableFrom": 1988
  },
  {
    "id": "idx_dfm_emaar",
    "name": "DFM / ADX UAE Dividend Leaders (Emaar/ADNOC)",
    "kind": "equity",
    "country": "uae",
    "meanReturn": 0.098,
    "volatility": 0.18,
    "dividendPct": 0.048,
    "shariaCompliant": true,
    "availableFrom": 2000
  },
  {
    "id": "sukuk_sovereign",
    "name": "GCC Sovereign Ijara Sukuk (5-Yr)",
    "kind": "sukuk",
    "country": "sau",
    "meanReturn": 0.052,
    "volatility": 0.03,
    "dividendPct": 0.052,
    "shariaCompliant": true,
    "availableFrom": 2002
  },
  {
    "id": "tbill_egy",
    "name": "Egyptian Treasury Bills (12-Month T-Bills)",
    "kind": "bond",
    "country": "egy",
    "meanReturn": 0.225,
    "volatility": 0.02,
    "dividendPct": 0.225,
    "shariaCompliant": false,
    "availableFrom": 1991
  },
  {
    "id": "bond_ust10",
    "name": "US 10-Year Treasury Bond",
    "kind": "bond",
    "country": "usa",
    "meanReturn": 0.044,
    "volatility": 0.045,
    "dividendPct": 0.042,
    "shariaCompliant": false,
    "availableFrom": 1960
  },
  {
    "id": "reit_global",
    "name": "Global Commercial & Healthcare REIT",
    "kind": "reit",
    "country": "usa",
    "meanReturn": 0.082,
    "volatility": 0.135,
    "dividendPct": 0.046,
    "shariaCompliant": true,
    "availableFrom": 1972
  },
  {
    "id": "idx_ftse100",
    "name": "FTSE 100 UK Dividend Index",
    "kind": "etf",
    "country": "gbr",
    "meanReturn": 0.076,
    "volatility": 0.135,
    "dividendPct": 0.038,
    "shariaCompliant": false,
    "availableFrom": 1984
  },
  {
    "id": "idx_dax40",
    "name": "DAX 40 German Industrials ETF",
    "kind": "etf",
    "country": "deu",
    "meanReturn": 0.084,
    "volatility": 0.165,
    "dividendPct": 0.028,
    "shariaCompliant": false,
    "availableFrom": 1988
  },
  {
    "id": "idx_nikkei225",
    "name": "Nikkei 225 Tokyo Index",
    "kind": "etf",
    "country": "jpn",
    "meanReturn": 0.072,
    "volatility": 0.18,
    "dividendPct": 0.018,
    "shariaCompliant": false,
    "availableFrom": 1960
  },
  {
    "id": "idx_nifty50",
    "name": "Nifty 50 India Growth Index",
    "kind": "etf",
    "country": "ind",
    "meanReturn": 0.125,
    "volatility": 0.205,
    "dividendPct": 0.013,
    "shariaCompliant": false,
    "availableFrom": 1996
  },
  {
    "id": "cry_btc",
    "name": "Bitcoin (BTC) Digital Asset",
    "kind": "crypto",
    "country": "usa",
    "meanReturn": 0.28,
    "volatility": 0.62,
    "dividendPct": 0.0,
    "shariaCompliant": false,
    "availableFrom": 2011
  },
  {
    "id": "cry_eth",
    "name": "Ethereum (ETH) Network Stake",
    "kind": "crypto",
    "country": "usa",
    "meanReturn": 0.24,
    "volatility": 0.66,
    "dividendPct": 0.032,
    "shariaCompliant": false,
    "availableFrom": 2016
  }
];
export const REMITTANCE_CHANNELS = [
  {
    "id": "instapay_official",
    "label": "InstaPay / Official Bank Transfer",
    "feePct": 0.005,
    "fxBonusPct": 0.0,
    "scamRisk": 0.0,
    "availableFrom": 2022
  },
  {
    "id": "swift_wire",
    "label": "International SWIFT Bank Wire",
    "feePct": 0.022,
    "fxBonusPct": 0.0,
    "scamRisk": 0.0,
    "availableFrom": 1973
  },
  {
    "id": "exchange_house",
    "label": "Licensed Exchange House (Al Ansari / Al Rajhi Tahweel / WU)",
    "feePct": 0.012,
    "fxBonusPct": 0.0,
    "scamRisk": 0.0,
    "availableFrom": 1968
  },
  {
    "id": "informal_hawala",
    "label": "Informal Parallel-Market Hawala Broker (+8% FX, Scam & Legal Risk!)",
    "feePct": 0.0,
    "fxBonusPct": 0.08,
    "scamRisk": 0.14,
    "availableFrom": 1960
  }
];
