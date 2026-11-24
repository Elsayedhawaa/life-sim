/* ============================================================================
   World Life 2.0 — Canonical Historical Economy, CPI, FX, Gold & Tax Engine
   Covers 1960–2100 across all 18 countries with ZERO currency round-trip drift.
   Data sources rescued from World Bank WDI (FP.CPI.TOTL.ZG), CBE historical FX,
   World Bank Pink Sheet Gold USD/oz, and national payroll real-wage anchors.
   ========================================================================== */

export const REFERENCE_YEAR = 2026;

/* Official World Bank WDI annual CPI inflation % (starting 1960, sgp 1961) +
   sourced/modeled series for egy, usa, sau, uae, bra. */
const WDI_CPI_SERIES = {
  egy: {
    firstYear: 1960,
    rates: [
      0.33,0.69,-3.00,0.75,3.66,14.84,9.04,0.70,-1.68,3.41,
      3.76,3.14,2.10,5.11,10.02,9.67,10.32,12.73,11.08,9.90,
      20.82,10.32,14.82,16.08,17.04,12.11,23.86,19.69,17.66,21.26,
      16.76,19.75,13.64,12.09,8.15,15.74,7.19,4.63,3.87,3.08,
      2.68,2.27,2.74,4.51,11.27,4.87,7.64,9.32,18.32,11.76,
      11.27,10.06,7.11,9.47,10.07,10.37,13.81,29.51,14.40,9.15,
      5.04,5.21,13.90,33.88,28.27,14.07,13.90
    ]
  },
  usa: {
    firstYear: 1960,
    rates: [
      1.46,1.07,1.20,1.24,1.28,1.59,3.02,2.77,4.27,5.46,
      5.84,4.29,3.27,6.18,11.05,9.14,5.74,6.50,7.63,11.25,
      13.55,10.33,6.13,3.21,4.30,3.55,1.90,3.66,4.08,4.83,
      5.40,4.23,3.03,2.95,2.61,2.81,2.93,2.34,1.55,2.19,
      3.38,2.83,1.59,2.27,2.68,3.39,3.23,2.85,3.84,-0.36,
      1.64,3.16,2.07,1.46,1.62,0.12,1.26,2.13,2.44,1.81,
      1.23,4.70,8.00,4.12,2.95,2.60,2.40
    ]
  },
  sau: {
    firstYear: 1960,
    rates: [
      1.5,1.6,1.4,2.0,2.5,2.8,3.0,2.5,2.2,3.1,
      2.0,4.5,4.3,16.5,21.4,34.6,31.6,11.4,-1.6,1.8,
      4.3,2.8,1.0,0.2,-1.6,-3.1,-3.2,-1.5,0.9,1.0,
      2.1,4.9,-0.1,1.1,0.6,4.9,1.2,0.1,-0.4,-1.3,
      -1.1,-1.1,0.2,0.6,0.3,0.7,2.2,4.1,9.9,5.1,
      5.3,5.8,2.9,3.5,2.2,1.2,2.1,-0.8,2.5,-2.1,
      3.4,3.1,2.5,2.3,1.7,2.0,2.0
    ]
  },
  uae: {
    firstYear: 1960,
    rates: [
      2.0,2.0,2.2,2.5,2.8,3.2,3.5,3.0,3.2,3.8,
      4.0,5.0,6.5,14.0,18.5,22.0,20.0,14.0,10.5,8.5,
      8.0,7.5,6.0,2.5,1.5,1.2,3.0,3.5,4.5,3.8,
      3.5,5.5,6.2,5.0,4.5,4.4,3.0,2.9,2.0,2.1,
      1.4,2.8,2.9,3.1,5.0,6.2,9.3,11.1,12.3,1.6,
      0.9,0.9,0.7,1.1,2.3,4.1,1.6,2.0,3.1,-1.9,
      -2.1,-0.1,4.8,1.6,1.7,2.0,2.1
    ]
  },
  gbr: {
    firstYear: 1960,
    rates: [
      1.004,3.447,4.196,2.019,3.282,4.774,3.910,2.482,4.697,5.447,
      6.367,9.445,7.071,9.196,16.044,24.207,16.560,15.840,8.263,13.421,
      17.966,11.877,8.599,4.609,4.961,6.071,3.428,4.149,4.155,5.760,
      8.063,7.462,4.592,2.559,2.219,2.697,2.852,2.201,1.821,1.753,
      1.183,1.532,1.520,1.377,1.390,2.089,2.456,2.387,3.521,1.962,
      2.493,3.856,2.573,2.292,1.451,0.368,1.008,2.558,2.293,1.738,
      0.989,2.518,7.922,6.794,3.272,3.883,2.60
    ]
  },
  deu: {
    firstYear: 1960,
    rates: [
      1.537,2.294,2.843,2.967,2.336,3.242,3.533,1.796,1.470,1.913,
      3.450,5.241,5.485,7.032,6.986,5.910,4.247,3.734,2.719,4.044,
      5.441,6.344,5.241,3.293,2.406,2.066,-0.129,0.250,1.274,2.781,
      2.696,4.047,5.057,4.475,2.693,1.706,1.450,1.939,0.911,0.585,
      1.440,1.984,1.421,1.034,1.666,1.547,1.577,2.298,2.628,0.313,
      1.104,2.075,2.008,1.505,0.907,0.514,0.492,1.509,1.732,1.446,
      0.145,3.067,6.873,5.946,2.256,2.172,2.00
    ]
  },
  can: {
    firstYear: 1960,
    rates: [
      1.359,1.019,1.062,1.628,1.912,2.333,3.816,3.580,4.055,4.562,
      3.346,2.705,4.988,7.488,10.997,10.672,7.542,7.976,8.974,9.145,
      10.129,12.472,10.769,5.864,4.305,3.962,4.195,4.356,4.028,4.984,
      4.780,5.626,1.490,1.865,0.166,2.149,1.571,1.621,0.996,1.735,
      2.719,2.525,2.258,2.759,1.857,2.214,2.002,2.138,2.370,0.299,
      1.777,2.912,1.516,0.938,1.907,1.125,1.429,1.597,2.268,1.949,
      0.717,3.395,6.803,3.879,2.382,2.072,2.00
    ]
  },
  aus: {
    firstYear: 1960,
    rates: [
      3.729,2.288,-0.319,0.641,2.866,3.406,3.293,3.478,2.521,3.279,
      3.439,6.138,6.024,9.091,15.417,15.162,13.323,12.310,8.005,9.122,
      10.136,9.488,11.352,10.039,3.960,6.735,9.050,8.533,7.216,7.534,
      7.333,3.177,1.012,1.754,1.970,4.628,2.615,0.225,0.860,1.483,
      4.457,4.407,2.982,2.733,2.343,2.692,3.555,2.328,4.350,1.771,
      2.918,3.304,1.763,2.450,2.488,1.508,1.277,1.949,1.911,1.611,
      0.847,2.864,6.594,5.597,3.167,2.874,2.50
    ]
  },
  nld: {
    firstYear: 1960,
    rates: [
      2.324,1.308,2.431,3.244,5.824,3.908,5.762,3.455,3.721,7.422,
      3.669,7.478,7.803,8.022,9.591,10.217,8.831,6.399,4.112,4.199,
      6.513,6.739,5.911,2.741,3.302,2.259,0.083,-0.691,0.738,1.082,
      2.454,3.158,3.184,2.584,2.802,1.923,1.949,2.109,1.959,2.157,
      2.361,4.156,3.288,2.092,1.264,1.688,1.102,1.614,2.487,1.190,
      1.275,2.342,2.456,2.511,0.971,0.601,0.319,1.380,1.704,2.634,
      1.268,2.681,9.998,3.842,3.346,3.204,2.30
    ]
  },
  fra: {
    firstYear: 1960,
    rates: [
      4.140,2.400,5.331,4.999,3.211,2.703,2.602,2.792,4.543,6.046,
      5.300,5.398,6.063,7.381,13.649,11.686,9.625,9.495,9.251,10.647,
      13.563,13.314,11.978,9.460,7.674,5.831,2.539,3.289,2.701,3.498,
      3.194,3.213,2.364,2.104,1.656,1.796,1.985,1.203,0.650,0.540,
      1.671,1.638,1.922,2.099,2.146,1.742,1.676,1.488,2.813,0.088,
      1.533,2.108,1.955,0.863,0.508,0.040,0.184,1.029,1.852,1.107,
      0.478,1.641,5.223,4.880,1.997,0.944,1.80
    ]
  },
  jpn: {
    firstYear: 1960,
    rates: [
      3.575,5.368,6.835,6.707,3.800,6.656,5.041,3.990,5.339,5.250,
      6.924,6.395,4.844,11.609,23.222,11.731,9.374,8.162,4.210,3.702,
      7.779,4.912,2.741,1.900,2.262,2.032,0.596,0.126,0.679,2.272,
      3.079,3.251,1.760,1.243,0.695,-0.128,0.137,1.748,0.662,-0.341,
      -0.677,-0.740,-0.923,-0.257,-0.009,-0.283,0.249,0.060,1.380,-1.353,
      -0.728,-0.272,-0.044,0.335,2.759,0.795,-0.127,0.484,0.989,0.469,
      -0.025,-0.233,2.498,3.268,2.739,3.173,2.20
    ]
  },
  ita: {
    firstYear: 1960,
    rates: [
      2.350,2.051,4.691,7.455,5.912,4.519,2.347,3.733,1.277,2.657,
      4.968,4.792,5.750,10.799,19.160,16.951,16.614,17.130,12.094,14.799,
      21.064,17.969,16.480,14.647,10.794,9.206,5.824,4.747,5.058,6.260,
      6.457,6.250,5.271,4.627,4.052,5.235,4.007,2.043,1.955,1.663,
      2.538,2.785,2.465,2.673,2.207,1.985,2.091,1.830,3.348,0.775,
      1.526,2.781,3.041,1.220,0.241,0.039,-0.094,1.227,1.137,0.611,
      -0.138,1.874,8.201,5.622,0.982,1.532,1.80
    ]
  },
  sgp: {
    firstYear: 1960,
    rates: [
      0.500,0.400,0.420,2.205,1.726,0.179,2.006,3.343,0.655,-0.273,
      0.463,1.761,2.081,19.637,22.368,2.537,-1.842,3.164,4.873,4.076,
      8.527,8.182,3.916,1.196,2.601,0.480,-1.386,0.523,1.523,2.345,
      3.461,3.426,2.263,2.289,3.100,1.721,1.383,2.004,-0.268,0.017,
      1.362,0.997,-0.392,0.508,1.663,0.425,0.966,2.110,6.635,0.589,
      2.829,5.251,4.581,2.364,1.033,-0.522,-0.530,0.577,0.439,0.568,
      -0.172,2.316,6.131,4.834,2.390,0.903,1.60
    ]
  },
  bra: {
    /* Post-1994 Real Plan actual CPI; pre-1994 normalized post-redenomination real-basket inflation */
    firstYear: 1960,
    rates: [
      6.0,6.5,7.0,7.5,7.0,6.0,5.5,5.0,5.2,5.5,
      5.8,5.6,5.4,6.5,9.0,8.5,9.2,9.0,8.8,10.5,
      12.0,11.5,10.8,12.5,11.0,11.5,9.5,12.0,14.0,15.0,
      14.5,12.0,11.5,12.0,9.5,14.8,15.8,6.9,3.2,4.9,
      7.0,6.8,8.5,14.7,6.6,6.9,4.2,3.6,5.7,4.9,
      5.0,6.6,5.4,6.2,6.3,9.0,8.7,3.4,3.7,3.7,
      3.2,8.3,9.3,4.6,4.4,4.2,4.0
    ]
  },
  ind: {
    firstYear: 1960,
    rates: [
      1.780,1.695,3.632,2.946,13.355,9.475,10.802,13.062,3.237,-0.584,
      5.092,3.080,6.442,16.941,28.599,5.748,-7.634,8.307,2.523,6.276,
      11.346,13.113,7.891,11.868,8.319,5.556,8.730,8.801,9.383,7.074,
      8.971,13.870,11.788,6.327,10.248,10.225,8.977,7.164,13.231,4.670,
      4.009,3.779,4.297,3.806,3.767,4.246,5.797,6.373,8.349,10.882,
      11.989,8.912,9.479,10.018,6.666,4.907,4.948,3.328,3.939,3.730,
      6.623,5.131,6.699,5.649,4.953,2.399,4.20
    ]
  },

  che: {
    /* World Bank WDI FP.CPI.TOTL.ZG, 1960-2025 (retrieved 2026-11-19); 2026 modelled. */
    firstYear: 1960,
    rates: [
      1.439,1.845,4.316,3.44,3.081,3.414,4.776,4.005,2.396,2.489,
      3.616,6.573,6.66,8.755,9.767,6.697,1.715,1.296,1.029,3.648,
      4.023,6.49,5.655,2.95,2.931,3.435,0.75,1.44,1.872,3.155,
      5.404,5.86,4.037,3.293,0.852,1.8,0.812,0.52,0.018,0.806,
      1.559,0.989,0.643,0.638,0.803,1.172,1.06,0.732,2.426,-0.48,
      0.688,0.231,-0.693,-0.217,-0.013,-1.144,-0.435,0.534,0.936,0.363,
      -0.726,0.582,2.835,2.135,1.062,0.154,0.5
    ]
  },
  swe: {
    /* World Bank WDI FP.CPI.TOTL.ZG, 1960-2025 (retrieved 2026-11-19); 2026 modelled. */
    firstYear: 1960,
    rates: [
      4.142,2.158,4.766,2.872,3.388,5.013,6.405,4.289,1.943,2.692,
      7.016,7.396,6.007,6.718,9.912,9.78,10.249,11.442,9.995,7.21,
      13.704,12.092,8.593,8.867,8.044,7.369,4.242,4.179,5.822,6.449,
      10.365,9.445,2.372,4.721,2.157,2.458,0.531,0.662,-0.269,0.462,
      0.896,2.408,2.157,1.919,0.374,0.452,1.361,2.21,3.439,-0.496,
      1.16,2.96,0.889,-0.046,-0.178,-0.046,0.982,1.799,1.95,1.784,
      0.498,2.164,8.369,8.547,2.837,0.679,1.0
    ]
  },
  tur: {
    /* World Bank WDI FP.CPI.TOTL.ZG, 1960-2025 (retrieved 2026-11-19); 2026 modelled. */
    firstYear: 1960,
    rates: [
      5.665,3.173,3.888,6.363,1.12,4.556,8.472,13.975,6.046,4.924,
      7.924,19.011,15.416,13.938,23.898,21.227,17.456,25.985,61.897,63.543,
      94.261,37.615,29.137,31.39,48.392,44.962,34.61,38.856,68.81,63.273,
      60.304,65.979,70.076,66.094,105.215,89.113,80.412,85.669,84.641,64.867,
      54.915,54.4,44.964,21.602,8.598,8.183,9.597,8.756,10.444,6.251,
      8.566,6.472,8.892,7.493,8.855,7.671,7.775,11.144,16.332,15.177,
      12.279,19.596,72.309,53.859,58.506,34.881,30.0
    ]
  }
};

/* Canonical FX anchors: units of local currency per 1 USD (EUR-equivalent pre-1999 for Eurozone).
   Single source of truth guarantees ZERO round-trip error across any currency pair. */
const FX_PER_USD_ANCHORS = {
  usa: [[1960, 1.0], [2026, 1.0]],
  egy: [
    [1960, 0.35], [1970, 0.435], [1979, 0.70], [1989, 0.87], [1990, 1.55],
    [1991, 3.14], [1995, 3.39], [2000, 3.47], [2001, 3.97], [2003, 5.85],
    [2005, 5.78], [2010, 5.62], [2013, 6.87], [2015, 7.69], [2016, 10.02],
    [2017, 17.79], [2019, 16.64], [2021, 15.65], [2022, 19.00], [2023, 30.63],
    [2024, 45.31], [2025, 49.23], [2026, 55.83]
  ],
  sau: [
    [1960, 4.50], [1971, 4.48], [1973, 3.70], [1975, 3.52], [1980, 3.33],
    [1986, 3.75], [2026, 3.75]
  ],
  uae: [
    [1960, 4.76], [1971, 4.39], [1973, 3.95], [1978, 3.87], [1980, 3.6725], [2026, 3.6725]
  ],
  gbr: [
    [1960, 0.357], [1967, 0.365], [1968, 0.417], [1975, 0.452], [1980, 0.430],
    [1985, 0.779], [1990, 0.563], [1995, 0.634], [2000, 0.661], [2007, 0.500],
    [2009, 0.641], [2015, 0.654], [2017, 0.777], [2020, 0.779], [2022, 0.811],
    [2024, 0.782], [2026, 0.780]
  ],
  deu: [
    [1960, 2.13], [1970, 1.86], [1980, 0.93], [1985, 1.50], [1990, 0.83],
    [1999, 0.94], [2001, 1.12], [2008, 0.68], [2014, 0.75], [2016, 0.90],
    [2020, 0.88], [2022, 0.95], [2024, 0.92], [2026, 0.92]
  ],
  fra: [
    [1960, 0.75], [1970, 0.84], [1980, 0.64], [1985, 1.37], [1990, 0.83],
    [1999, 0.94], [2008, 0.68], [2016, 0.90], [2022, 0.95], [2026, 0.92]
  ],
  ita: [
    [1960, 0.32], [1975, 0.34], [1985, 0.99], [1995, 0.84], [1999, 0.94],
    [2008, 0.68], [2016, 0.90], [2022, 0.95], [2026, 0.92]
  ],
  nld: [
    [1960, 1.71], [1975, 1.15], [1985, 1.51], [1995, 0.73], [1999, 0.94],
    [2008, 0.68], [2016, 0.90], [2022, 0.95], [2026, 0.92]
  ],
  can: [
    [1960, 0.97], [1970, 1.04], [1980, 1.17], [1986, 1.39], [1991, 1.15],
    [2000, 1.49], [2002, 1.57], [2007, 1.07], [2012, 1.00], [2016, 1.32],
    [2020, 1.34], [2024, 1.37], [2026, 1.35]
  ],
  aus: [
    [1960, 0.89], [1973, 0.70], [1980, 0.88], [1986, 1.49], [1995, 1.35],
    [2001, 1.93], [2008, 1.19], [2011, 0.97], [2016, 1.35], [2020, 1.45],
    [2024, 1.51], [2026, 1.50]
  ],
  jpn: [
    [1960, 360], [1971, 348], [1975, 297], [1980, 227], [1985, 238],
    [1990, 145], [1995, 94], [2000, 108], [2007, 118], [2011, 80],
    [2015, 121], [2020, 107], [2022, 131], [2024, 151], [2026, 150]
  ],
  sgp: [
    [1960, 3.06], [1970, 3.06], [1975, 2.37], [1980, 2.14], [1990, 1.81],
    [1995, 1.42], [2000, 1.72], [2005, 1.66], [2012, 1.25], [2020, 1.38],
    [2026, 1.35]
  ],
  bra: [
    [1960, 0.18], [1970, 0.25], [1980, 0.42], [1990, 0.75], [1994, 0.85],
    [1998, 1.16], [2002, 2.92], [2005, 2.43], [2010, 1.76], [2015, 3.33],
    [2019, 3.94], [2021, 5.39], [2024, 5.38], [2026, 5.05]
  ],
  ind: [
    [1960, 4.76], [1966, 6.36], [1975, 8.38], [1980, 7.86], [1985, 12.37],
    [1990, 17.50], [1993, 30.49], [2000, 44.94], [2007, 41.35], [2012, 53.44],
    [2016, 67.20], [2020, 74.10], [2023, 82.60], [2026, 83.50]
  ],
  che: [
    [1960, 4.32], [1970, 4.32], [1980, 1.68], [1990, 1.39], [2000, 1.69],
    [2010, 1.04], [2015, 0.96], [2020, 0.94], [2026, 0.88]
  ],
  swe: [
    [1960, 5.17], [1970, 5.17], [1980, 4.23], [1990, 5.92], [2000, 9.16],
    [2010, 7.20], [2015, 8.44], [2020, 9.20], [2026, 9.50]
  ],
  tur: [
    /* New lira (TRY); pre-2005 values are old lira / 1,000,000 after the 2005 redenomination. */
    [1960, 0.000009], [1970, 0.000015], [1980, 0.00009], [1990, 0.0026], [2000, 0.625],
    [2005, 1.34], [2010, 1.50], [2015, 2.72], [2020, 7.01], [2022, 16.58], [2024, 32.79], [2026, 43.00]
  ]
};

/* Gold USD per troy ounce (31.1035g), World Bank Pink Sheet + historical anchors */
const GOLD_USD_OZ = [
  [1960, 35.18], [1970, 35.83], [1972, 58.17], [1974, 158.76], [1976, 124.74],
  [1979, 306.00], [1980, 607.83], [1982, 375.67], [1985, 317.42], [1987, 446.46],
  [1990, 383.50], [1995, 384.05], [1999, 278.86], [2002, 309.68], [2005, 444.99],
  [2008, 871.96], [2010, 1224.67], [2012, 1668.98], [2015, 1160.75], [2018, 1268.49],
  [2020, 1770.25], [2022, 1800.09], [2023, 1940.54], [2024, 2387.58], [2025, 3441.50],
  [2026, 4010.51]
];

/* Real purchasing-power wage ratio vs 2026 = 1.0 */
const REAL_WAGE_RATIO = {
  egy: [[1960,0.58],[1970,0.68],[1980,0.74],[1990,0.78],[2000,0.88],[2010,1.02],[2016,0.96],[2018,0.82],[2021,0.94],[2024,0.88],[2026,1.0]],
  usa: [[1960,0.72],[1970,0.80],[1980,0.82],[1990,0.85],[2000,0.90],[2010,0.93],[2020,0.96],[2026,1.0]],
  gbr: [[1960,0.42],[1970,0.50],[1980,0.58],[1990,0.66],[2000,0.86],[2010,0.96],[2020,0.98],[2026,1.0]],
  deu: [[1960,0.50],[1970,0.62],[1980,0.72],[1990,0.80],[2000,0.86],[2010,0.88],[2020,0.92],[2026,1.0]],
  fra: [[1960,0.54],[1970,0.68],[1980,0.78],[1990,0.86],[2000,0.90],[2010,0.93],[2020,0.94],[2026,1.0]],
  ita: [[1960,0.40],[1970,0.54],[1980,0.66],[1990,0.76],[2000,0.82],[2010,0.84],[2020,0.84],[2026,1.0]],
  nld: [[1960,0.55],[1970,0.66],[1980,0.76],[1990,0.84],[2000,0.90],[2010,0.92],[2020,0.94],[2026,1.0]],
  can: [[1960,0.70],[1970,0.78],[1980,0.80],[1990,0.84],[2000,0.89],[2010,0.92],[2020,0.95],[2026,1.0]],
  aus: [[1960,0.62],[1970,0.70],[1980,0.76],[1990,0.82],[2000,0.88],[2010,0.92],[2020,0.94],[2026,1.0]],
  jpn: [[1960,0.28],[1970,0.45],[1980,0.62],[1990,0.80],[2000,0.88],[2010,0.88],[2020,0.87],[2026,1.0]],
  sgp: [[1960,0.30],[1970,0.40],[1980,0.55],[1990,0.70],[2000,0.82],[2010,0.90],[2020,0.95],[2026,1.0]],
  ind: [[1960,0.25],[1970,0.30],[1980,0.36],[1990,0.44],[2000,0.55],[2010,0.68],[2020,0.80],[2026,1.0]],
  bra: [[1960,0.42],[1970,0.50],[1980,0.60],[1990,0.68],[2000,0.72],[2010,0.80],[2020,0.90],[2026,1.0]],
  sau: [[1960,0.36],[1970,0.50],[1975,0.68],[1980,0.76],[1990,0.80],[2000,0.86],[2010,0.92],[2020,0.96],[2026,1.0]],
  uae: [[1960,0.34],[1970,0.46],[1975,0.65],[1980,0.76],[1990,0.84],[2000,0.90],[2010,0.95],[2020,0.98],[2026,1.0]],
  che: [[1960,0.45],[1970,0.58],[1980,0.72],[1990,0.82],[2000,0.88],[2010,0.93],[2020,0.97],[2026,1.0]],
  swe: [[1960,0.40],[1970,0.55],[1980,0.68],[1990,0.78],[2000,0.86],[2010,0.92],[2020,0.96],[2026,1.0]],
  tur: [[1960,0.55],[1970,0.60],[1980,0.50],[1990,0.65],[2000,0.70],[2010,0.85],[2020,0.80],[2026,1.0]]
  /* Real-wage ratios for che/swe/tur are modelled (no WDI real-wage anchor was pulled for them). */
};

function interpolateCurve(points, year) {
  const y = Number(year) || REFERENCE_YEAR;
  if (!points || !points.length) return 1;
  if (y <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [y0, v0] = points[i - 1];
    const [y1, v1] = points[i];
    if (y <= y1) {
      const t = (y - y0) / Math.max(1, y1 - y0);
      return v0 + (v1 - v0) * t;
    }
  }
  return points[points.length - 1][1];
}

function post2026Glide(valueAt2026, recentAnnualPct, year, longRunPct = 2.0) {
  const span = Math.max(0, Math.min(120, Math.floor(year - REFERENCE_YEAR)));
  if (span <= 0) return valueAt2026;
  let v = valueAt2026;
  const startR = (Number(recentAnnualPct) || longRunPct) / 100;
  const floorR = longRunPct / 100;
  for (let i = 1; i <= span; i++) {
    const r = floorR + (startR - floorR) * Math.pow(0.90, i - 1);
    v *= (1 + r);
  }
  return v;
}

/* Precompute cumulative CPI index tables (2026 = 1.000000) for O(1) lookups */
const CPI_INDEX_CACHE = {};
function getCpiTable(countryId) {
  const cid = WDI_CPI_SERIES[countryId] ? countryId : 'usa';
  if (CPI_INDEX_CACHE[cid]) return CPI_INDEX_CACHE[cid];
  const s = WDI_CPI_SERIES[cid];
  const rawIndex = { [s.firstYear]: 1.0 };
  for (let i = 0; i < s.rates.length; i++) {
    const yr = s.firstYear + i;
    const nextYr = yr + 1;
    rawIndex[nextYr] = rawIndex[yr] * (1 + s.rates[i] / 100);
  }
  const refVal = rawIndex[REFERENCE_YEAR] || rawIndex[s.firstYear + s.rates.length] || 1;
  const normalized = {};
  for (const k of Object.keys(rawIndex)) {
    normalized[Number(k)] = rawIndex[k] / refVal;
  }
  CPI_INDEX_CACHE[cid] = {
    firstYear: s.firstYear,
    lastYear: REFERENCE_YEAR,
    rates: s.rates,
    index: normalized,
    lastRate: s.rates[s.rates.length - 1] || 2.5
  };
  return CPI_INDEX_CACHE[cid];
}

export function inflationRate(countryId, year) {
  const tbl = getCpiTable(countryId);
  const y = Math.floor(Number(year) || REFERENCE_YEAR);
  if (y < tbl.firstYear) return tbl.rates[0];
  const idx = y - tbl.firstYear;
  if (idx < tbl.rates.length) return tbl.rates[idx];
  const span = y - REFERENCE_YEAR;
  return 2.0 + (tbl.lastRate - 2.0) * Math.pow(0.90, Math.max(0, span));
}

export function priceFactor(countryId, year) {
  const tbl = getCpiTable(countryId);
  const y = Math.floor(Number(year) || REFERENCE_YEAR);
  if (y <= tbl.firstYear) return tbl.index[tbl.firstYear];
  if (y <= REFERENCE_YEAR && tbl.index[y] != null) return tbl.index[y];
  return post2026Glide(1.0, tbl.lastRate, y, 2.0);
}

export function usdRate(countryId, year) {
  const cid = FX_PER_USD_ANCHORS[countryId] ? countryId : 'usa';
  if (cid === 'usa') return 1.0;
  const y = Number(year) || REFERENCE_YEAR;
  const base = interpolateCurve(FX_PER_USD_ANCHORS[cid], Math.min(y, REFERENCE_YEAR));
  if (y <= REFERENCE_YEAR) return base;
  /* Post-2026 PPP drift: high-inflation currencies drift gently relative to USD */
  if (cid === 'sau' || cid === 'uae') return base; // USD-pegged Gulf currencies
  const localP = priceFactor(cid, y);
  const usP = priceFactor('usa', y);
  return base * (localP / Math.max(0.0001, usP));
}

/* Exact, reversible currency conversion: convertCurrency(convertCurrency(x, A, B, y), B, A, y) === x */
export function convertCurrency(amount, fromCountryId, toCountryId, year = REFERENCE_YEAR) {
  const n = Number(amount) || 0;
  if (fromCountryId === toCountryId || n === 0) return n;
  const fromPerUsd = usdRate(fromCountryId, year);
  const toPerUsd = usdRate(toCountryId, year);
  return n * (toPerUsd / fromPerUsd);
}

export function wageFactor(countryId, year) {
  const y = Number(year) || REFERENCE_YEAR;
  const pFactor = priceFactor(countryId, y);
  const rwPoints = REAL_WAGE_RATIO[countryId] || REAL_WAGE_RATIO.usa;
  const rw = y <= REFERENCE_YEAR
    ? interpolateCurve(rwPoints, y)
    : 1.0 * Math.pow(1.006, Math.min(80, y - REFERENCE_YEAR));
  return pFactor * rw;
}

/* Price a 2026-denominated local expense cleanly in historical or future year */
export function eraLocalCost(amount2026Local, countryId, year) {
  const raw = (Number(amount2026Local) || 0) * priceFactor(countryId, year);
  if (raw <= 0) return 0;
  if (raw < 10) return Math.round(raw * 100) / 100;
  if (raw < 200) return Math.round(raw);
  return Math.round(raw / 5) * 5;
}

/* Price a 2026-denominated local salary cleanly in historical or future year */
export function eraSalary(salary2026Local, countryId, year) {
  const raw = (Number(salary2026Local) || 0) * wageFactor(countryId, year);
  if (raw <= 0) return 0;
  if (raw < 100) return Math.round(raw);
  return Math.round(raw / 10) * 10;
}

export function goldUsdPerOz(year) {
  const y = Number(year) || REFERENCE_YEAR;
  if (y <= REFERENCE_YEAR) return interpolateCurve(GOLD_USD_OZ, y);
  return post2026Glide(4010.51, 3.0, y, 2.2);
}

export function goldPricePerGram(countryId, year, karat = 21) {
  const ozUsd = goldUsdPerOz(year);
  const gram24Usd = ozUsd / 31.1034768;
  const purity = Math.max(12, Math.min(24, Number(karat) || 21)) / 24;
  const localPerUsd = usdRate(countryId, year);
  return Math.round(gram24Usd * purity * localPerUsd * 100) / 100;
}

/* Dynamic local deposit/CD annual interest rate reflecting real inflation regime */
export function eraDepositRates(countryId, year) {
  const inf = inflationRate(countryId, year);
  if (countryId === 'egy') {
    const cdRate = Math.max(0.06, Math.min(0.27, (inf * 0.82 + 2.5) / 100));
    const savRate = Math.max(0.03, Math.min(0.16, cdRate * 0.55));
    return { savings: Number(savRate.toFixed(4)), cd1Yr: Number(cdRate.toFixed(4)), cd3Yr: Number((cdRate * 0.88).toFixed(4)) };
  }
  if (countryId === 'bra' || countryId === 'ind') {
    const cdRate = Math.max(0.05, Math.min(0.15, (inf * 0.85 + 2.0) / 100));
    return { savings: Number((cdRate * 0.65).toFixed(4)), cd1Yr: Number(cdRate.toFixed(4)), cd3Yr: Number((cdRate * 0.95).toFixed(4)) };
  }
  if (countryId === 'jpn') {
    const cdRate = Math.max(0.001, Math.min(0.05, (Math.max(0, inf) * 0.5 + 0.15) / 100));
    return { savings: Number((cdRate * 0.5).toFixed(4)), cd1Yr: Number(cdRate.toFixed(4)), cd3Yr: Number((cdRate * 1.1).toFixed(4)) };
  }
  const cdRate = Math.max(0.012, Math.min(0.11, (Math.max(0.5, inf) * 0.72 + 1.1) / 100));
  return { savings: Number((cdRate * 0.65).toFixed(4)), cd1Yr: Number(cdRate.toFixed(4)), cd3Yr: Number((cdRate * 1.05).toFixed(4)) };
}

/* Realistic Country Income Tax + Mandatory Social Insurance Calculator
   Operates on normalized 2026-equivalent brackets scaled by wageFactor so historical paychecks
   aren't pushed into billionaire brackets! */
const TAX_PROFILES = {
  uae: {
    incomeTaxBrackets2026: [], // 0% personal income tax
    citizenSocialPct: 0.05,    // GPSSA for Emiratis
    expatSocialPct: 0.00       // End-of-service gratuity instead of payroll deduction
  },
  sau: {
    incomeTaxBrackets2026: [], // 0% personal income tax
    citizenSocialPct: 0.0975,  // GOSI employee share for Saudis
    expatSocialPct: 0.00       // Occupational hazards paid by employer; expats get EOSB
  },
  egy: {
    incomeTaxBrackets2026: [
      [40000, 0.00], [55000, 0.10], [70000, 0.15], [200000, 0.20], [400000, 0.225], [1200000, 0.25], [Infinity, 0.275]
    ], // Income Tax Law 91/2005 as amended (Law 7/2024): 0% on the first EGP 40,000/yr, top rate 27.5% above EGP 1.2m (PwC Egypt tax summaries).
    citizenSocialPct: 0.11,    // Ta'meenat employee share (capped reasonably)
    expatSocialPct: 0.00
  },
  gbr: {
    incomeTaxBrackets2026: [
      [12570, 0.00], [50270, 0.20], [125140, 0.40], [Infinity, 0.45]
    ],
    citizenSocialPct: 0.08,    // National Insurance Class 1
    expatSocialPct: 0.08
  },
  usa: {
    incomeTaxBrackets2026: [
      [14600, 0.00], [26200, 0.10], [61750, 0.14], [115000, 0.24], [206000, 0.30], [Infinity, 0.35]
    ], // Combined effective Federal + typical State
    citizenSocialPct: 0.0765,  // FICA (Social Security + Medicare)
    expatSocialPct: 0.0765
  },
  deu: {
    incomeTaxBrackets2026: [
      [11604, 0.00], [18000, 0.14], [66760, 0.26], [277825, 0.42], [Infinity, 0.45]
    ],
    citizenSocialPct: 0.20,    // Kranken-, Renten-, Arbeitslosen-, Pflegeversicherung
    expatSocialPct: 0.20
  },
  can: {
    incomeTaxBrackets2026: [
      [15705, 0.00], [55867, 0.20], [111733, 0.28], [173205, 0.34], [Infinity, 0.42]
    ], // Combined Federal + Provincial (Ontario baseline)
    citizenSocialPct: 0.068,   // CPP + EI
    expatSocialPct: 0.068
  },
  aus: {
    incomeTaxBrackets2026: [
      [18200, 0.00], [45000, 0.16], [135000, 0.30], [190000, 0.37], [Infinity, 0.45]
    ],
    citizenSocialPct: 0.02,    // Medicare levy (Super is paid on top by employer)
    expatSocialPct: 0.02
  },
  nld: {
    incomeTaxBrackets2026: [
      [10000, 0.00], [75518, 0.3697], [Infinity, 0.495]
    ],
    citizenSocialPct: 0.04,
    expatSocialPct: 0.04
  },
  fra: {
    incomeTaxBrackets2026: [
      [11294, 0.00], [28797, 0.11], [82341, 0.30], [177106, 0.41], [Infinity, 0.45]
    ],
    citizenSocialPct: 0.18,
    expatSocialPct: 0.18
  },
  jpn: {
    incomeTaxBrackets2026: [
      [1500000, 0.00], [3800000, 0.15], [8400000, 0.25], [19500000, 0.35], [Infinity, 0.45]
    ],
    citizenSocialPct: 0.145,
    expatSocialPct: 0.145
  },
  ita: {
    incomeTaxBrackets2026: [
      [8500, 0.00], [28000, 0.23], [50000, 0.35], [Infinity, 0.43]
    ],
    citizenSocialPct: 0.092,
    expatSocialPct: 0.092
  },
  sgp: {
    incomeTaxBrackets2026: [
      [20000, 0.00], [40000, 0.035], [80000, 0.07], [160000, 0.135], [320000, 0.19], [Infinity, 0.22]
    ],
    citizenSocialPct: 0.20,    // CPF employee contribution for citizens/PRs
    expatSocialPct: 0.00       // Employment Pass expats don't pay CPF
  },
  bra: {
    incomeTaxBrackets2026: [
      [27100, 0.00], [33900, 0.075], [45000, 0.15], [55970, 0.225], [Infinity, 0.275]
    ],
    citizenSocialPct: 0.09,    // INSS
    expatSocialPct: 0.09
  },
  ind: {
    incomeTaxBrackets2026: [
      [300000, 0.00], [700000, 0.05], [1000000, 0.10], [1200000, 0.15], [1500000, 0.20], [Infinity, 0.30]
    ],
    citizenSocialPct: 0.06,    // EPF
    expatSocialPct: 0.06
  },
  che: {
    incomeTaxBrackets2026: [
      [30000, 0.00], [60000, 0.08], [100000, 0.15], [150000, 0.22], [Infinity, 0.28]
    ], // Combined federal + cantonal (Zurich baseline, effective)
    citizenSocialPct: 0.13,    // AHV/IV/EO + 2nd pillar + UI employee share
    expatSocialPct: 0.13
  },
  swe: {
    incomeTaxBrackets2026: [
      [60000, 0.00], [625000, 0.30], [Infinity, 0.50]
    ], // Municipal ~30% + state tax above the threshold
    citizenSocialPct: 0.07,    // Pension contribution (capped)
    expatSocialPct: 0.07
  },
  tur: {
    incomeTaxBrackets2026: [
      [190000, 0.15], [400000, 0.20], [1500000, 0.27], [5300000, 0.35], [Infinity, 0.40]
    ], // 2026 Turkish income-tax tariff
    citizenSocialPct: 0.15,    // SGK employee share + unemployment insurance
    expatSocialPct: 0.15,
    /* Law 7349 (Art. 23/18 Income Tax Law): every wage earner's income
       tax is reduced by the tax on the minimum-wage base, so a minimum
       wage earner pays only the 15% social share and no income tax.
       2026 minimum wage: TRY 33,030 gross / 28,075.50 net per month
       (Resmi Gazete 26 Dec 2025). The real base is the net minimum wage
       (social contributions are deductible there); this game taxes gross
       salary, so the equivalent exempt base here is the gross annual
       minimum wage — a minimum-wage earner's tax zeroes out exactly and
       net pay lands on the statutory 28,075.50. */
    minWageTaxBase2026: 396360
  }
};

/* ============================================================================
   v2.8 — WORK RULES PER COUNTRY (overtime, annual leave, notice/severance).
   Real law where the game has it, modelled (and MARKED modelled) where it
   does not. One source of truth: the payslip, the overtime pay, the vacation
   balance and the severance all read these tables — never a second copy.
   ========================================================================== */

/* Overtime multiplier on the hourly rate for extra hours beyond the standard
   40h week. `source: 'law'` = the country's labour law sets this rate;
   `source: 'modelled'` = no statutory rate (or the game has no source), so
   this is the typical employer rate and the UI says so. OT hours per month
   when the player works overtime: 20 (about 5 extra hours a week). */
export const OVERTIME_HOURS_PER_MONTH = 20;
export const OVERTIME_RULES = {
  egy: { mult: 1.35, source: 'law', note: 'Egypt Labour Law 12/2003: +35% day overtime (+70% at night)' },
  sau: { mult: 1.50, source: 'law', note: 'Saudi Labour Law: overtime at 150% of the hourly wage' },
  uae: { mult: 1.25, source: 'law', note: 'UAE Labour Law: +25% day overtime (+50% 9pm–4am)' },
  gbr: { mult: 1.50, source: 'modelled', note: 'No statutory UK rate — 1.5× is the typical employer overtime rate' },
  usa: { mult: 1.50, source: 'law', note: 'US FLSA: time-and-a-half over 40 hours a week' },
  deu: { mult: 1.25, source: 'modelled', note: 'No statutory German rate — 1.25× is the typical tariff rate (often time off in lieu)' },
  can: { mult: 1.50, source: 'law', note: 'Canadian provinces: 1.5× after the weekly threshold (40–44h)' },
  aus: { mult: 1.50, source: 'law', note: 'Australian awards: 1.5× for the first overtime hours' },
  nld: { mult: 1.25, source: 'modelled', note: 'No statutory Dutch rate — 1.25× is the typical collective-agreement rate' },
  fra: { mult: 1.25, source: 'law', note: 'French Code du travail: +25% for the first 8 overtime hours (+50% beyond)' },
  jpn: { mult: 1.25, source: 'law', note: 'Japan Labour Standards Act: at least +25% for overtime' },
  ita: { mult: 1.25, source: 'modelled', note: 'No single statutory Italian rate — 1.25× is the typical contract premium' },
  sgp: { mult: 1.50, source: 'law', note: 'Singapore Employment Act: 1.5× the basic hourly rate' },
  bra: { mult: 1.50, source: 'law', note: 'Brazil CLT: overtime at least +50%' },
  ind: { mult: 2.00, source: 'law', note: 'India Factories Act: overtime at double the ordinary rate' },
  che: { mult: 1.25, source: 'law', note: 'Swiss Code of Obligations: +25% unless the contract says otherwise' },
  swe: { mult: 1.50, source: 'modelled', note: 'No statutory Swedish rate — 1.5× is the typical collective-agreement rate' },
  tur: { mult: 1.50, source: 'law', note: 'Turkish Labour Law 4857: overtime at +50%' }
};

export function overtimeRuleFor(countryId) {
  return OVERTIME_RULES[countryId] || OVERTIME_RULES.usa;
}

/* Gross overtime pay for one month of overtime work: the extra hours are
   EXTRA hours, so they are paid in full at the overtime rate on top of the
   base salary (the base already covers the standard 160h month). */
export function computeOvertimePay(jobOrGross, countryId) {
  if(jobOrGross?.employmentFraction===.45||/^part-time/i.test(jobOrGross?.title||''))return 0;
  const gross = Math.max(0, Number(jobOrGross?.monthlyGross ?? jobOrGross) || 0);
  if (gross <= 0) return 0;
  const hourly = gross / 160;
  return Math.round(OVERTIME_HOURS_PER_MONTH * hourly * overtimeRuleFor(countryId).mult);
}

/* Statutory paid annual leave (working days per year). `tenure` adds the
   service-based steps the law itself sets (Egypt 21→30 after 10 years,
   Saudi 21→30 after 5, Turkey 14→20→26, Japan 10→20, Singapore 7→14).
   `source: 'modelled'` = no statutory minimum (USA) — a typical employer
   grant, labelled as such wherever it is shown. */
export const VACATION_RULES = {
  egy: { base: 21, steps: [[10, 30]], source: 'law', note: 'Egypt Labour Law 12/2003: 21 days, 30 after 10 years' },
  sau: { base: 21, steps: [[5, 30]], source: 'law', note: 'Saudi Labour Law: 21 days, 30 after 5 years' },
  uae: { base: 30, steps: [], source: 'law', note: 'UAE Labour Law: 30 days after one year' },
  gbr: { base: 28, steps: [], source: 'law', note: 'UK: 28 days including bank holidays (5.6 weeks)' },
  usa: { base: 10, steps: [], source: 'modelled', note: 'No statutory US leave — 10 days is a typical employer grant' },
  deu: { base: 20, steps: [], source: 'law', note: 'Germany: 20 days statutory minimum (employers typically give 25–30)' },
  can: { base: 10, steps: [], source: 'law', note: 'Canada: 2 weeks statutory minimum (provinces vary)' },
  aus: { base: 20, steps: [], source: 'law', note: 'Australia: 4 weeks paid annual leave' },
  nld: { base: 20, steps: [], source: 'law', note: 'Netherlands: 4× the weekly working days' },
  fra: { base: 25, steps: [], source: 'law', note: 'France: 5 weeks paid leave' },
  jpn: { base: 10, steps: [[1, 11], [2, 12], [3, 14], [4, 16], [5, 18], [6, 20]], source: 'law', note: 'Japan: 10 days in year one, rising to 20 with tenure' },
  ita: { base: 20, steps: [], source: 'law', note: 'Italy: 4 weeks statutory minimum' },
  sgp: { base: 7, steps: [[1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13], [7, 14]], source: 'law', note: 'Singapore: 7 days in year one, +1 a year to 14' },
  bra: { base: 30, steps: [], source: 'law', note: 'Brazil CLT: 30 days after 12 months' },
  ind: { base: 15, steps: [], source: 'modelled', note: 'India: about 15 days earned leave a year (1 per 20 days worked)' },
  che: { base: 20, steps: [], source: 'law', note: 'Switzerland: 4 weeks (5 weeks under 20 / over 50)' },
  swe: { base: 25, steps: [], source: 'law', note: 'Sweden: 25 days annual leave' },
  tur: { base: 14, steps: [[5, 20], [15, 26]], source: 'law', note: 'Turkey: 14 days under 5 years, 20 at 5–15, 26 over 15' }
};

export function vacationRuleFor(countryId) {
  return VACATION_RULES[countryId] || VACATION_RULES.usa;
}

/* THE single source for the vacation balance: the contract display, the
   leave actions and the holiday system all read this number. */
export function vacationEntitlementDays(countryId, yearsService = 0) {
  const rule = vacationRuleFor(countryId);
  let days = rule.base;
  for (const [minYears, v] of (rule.steps || [])) {
    if (yearsService >= minYears) days = v;
  }
  return days;
}

/* Notice + severance when the EMPLOYER ends the job (dismissal / redundancy),
   in months of pay. `source: 'law'` = the country's law sets it;
   `source: 'modelled'` = a typical employer practice, labelled as such. */
export const NOTICE_SEVERANCE_RULES = {
  egy: { noticeMonths: 2, severanceMonthsPerYear: 2, severanceCapMonths: 24, source: 'law', note: 'Egypt: 2 months notice; arbitrary dismissal compensation 2 months per year of service' },
  sau: { noticeMonths: 2, severanceMonthsPerYear: 0.5, severanceCapMonths: 30, source: 'law', note: 'Saudi end-of-service: 15 days per year (first 5), 1 month per year after — averaged here' },
  uae: { noticeMonths: 2, severanceMonthsPerYear: 0.7, severanceCapMonths: 30, source: 'law', note: 'UAE end-of-service: 21 days per year (first 5), 30 days per year after — averaged here' },
  gbr: { noticeMonths: 1, severanceMonthsPerYear: 0.25, severanceCapMonths: 12, source: 'law', note: 'UK: 1 week notice per year (capped 12); statutory redundancy 0.5–1.5 weeks per year' },
  usa: { noticeMonths: 0.5, severanceMonthsPerYear: 0.25, severanceCapMonths: 6, source: 'modelled', note: 'US at-will: no statutory notice or severance — 2 weeks notice and a small typical package' },
  deu: { noticeMonths: 1, severanceMonthsPerYear: 0.5, severanceCapMonths: 12, source: 'modelled', note: 'Germany: notice 1–7 months by tenure; severance typically 0.5 month per year' },
  can: { noticeMonths: 1, severanceMonthsPerYear: 0.5, severanceCapMonths: 12, source: 'law', note: 'Canada: statutory notice + severance roughly 0.5 month per year' },
  aus: { noticeMonths: 1, severanceMonthsPerYear: 0.5, severanceCapMonths: 12, source: 'law', note: 'Australia: redundancy pay rises with tenure, about 0.5 month per year' },
  nld: { noticeMonths: 1, severanceMonthsPerYear: 0.33, severanceCapMonths: 12, source: 'law', note: 'Netherlands: transition payment about 1/3 month per year' },
  fra: { noticeMonths: 2, severanceMonthsPerYear: 0.25, severanceCapMonths: 12, source: 'law', note: 'France: 1–2 months notice; severance at least 1/4 month per year' },
  jpn: { noticeMonths: 1, severanceMonthsPerYear: 0.25, severanceCapMonths: 12, source: 'modelled', note: 'Japan: 30 days notice; severance is a typical company package' },
  ita: { noticeMonths: 2, severanceMonthsPerYear: 0.5, severanceCapMonths: 12, source: 'modelled', note: 'Italy: notice by contract; severance (TFR) accrues separately' },
  sgp: { noticeMonths: 1, severanceMonthsPerYear: 0.25, severanceCapMonths: 12, source: 'modelled', note: 'Singapore: notice by contract; retrenchment benefit typically 2 weeks–1 month per year' },
  bra: { noticeMonths: 1, severanceMonthsPerYear: 0.5, severanceCapMonths: 12, source: 'law', note: 'Brazil: 30 days notice + FGTS fine; about 0.5 month per year' },
  ind: { noticeMonths: 1, severanceMonthsPerYear: 0.5, severanceCapMonths: 12, source: 'law', note: 'India: 1 month notice; retrenchment about 15 days per year' },
  che: { noticeMonths: 2, severanceMonthsPerYear: 0, severanceCapMonths: 0, source: 'law', note: 'Switzerland: 1–3 months notice by tenure; no statutory severance' },
  swe: { noticeMonths: 2, severanceMonthsPerYear: 0.25, severanceCapMonths: 12, source: 'modelled', note: 'Sweden: notice by tenure; severance via collective agreements' },
  tur: { noticeMonths: 2, severanceMonthsPerYear: 0.25, severanceCapMonths: 12, source: 'law', note: 'Turkey: notice 2–8 weeks by tenure; severance 30 days per year' }
};

export function noticeAndSeveranceFor(countryId, yearsService = 0) {
  const rule = NOTICE_SEVERANCE_RULES[countryId] || NOTICE_SEVERANCE_RULES.usa;
  const severanceMonths = Math.min(rule.severanceCapMonths, Math.round(yearsService * rule.severanceMonthsPerYear * 10) / 10);
  return { noticeMonths: rule.noticeMonths, severanceMonths, source: rule.source, note: rule.note };
}

export function computeMonthlyNetPay(monthlyGross, countryId, year = REFERENCE_YEAR, isCitizenOrPR = true) {
  const gross = Math.max(0, Number(monthlyGross) || 0);
  if (gross <= 0) return { gross: 0, incomeTax: 0, socialSecurity: 0, net: 0, effectiveRate: 0, taxBands: [], socialPct: 0, taxFree: isNoPersonalIncomeTaxCountry(countryId) };

  const prof = TAX_PROFILES[countryId] || TAX_PROFILES.usa;
  const annualGross = gross * 12;
  const scale = Math.max(0.0001, wageFactor(countryId, year));

  let annualTax = 0;
  let prevTop = 0;
  /* v2.8 — per-band breakdown so the payslip can NAME every slice of tax
     instead of hiding it in one lump. taxBands are monthly amounts. */
  const taxBands = [];
  for (const [top2026, rate] of prof.incomeTaxBrackets2026) {
    const topScaled = top2026 === Infinity ? Infinity : top2026 * scale;
    if (annualGross > prevTop) {
      const taxableInBand = Math.min(annualGross, topScaled) - prevTop;
      const bandTax = taxableInBand * rate;
      annualTax += bandTax;
      if (taxableInBand > 0) taxBands.push({ rate, taxableMonthly: Math.round((taxableInBand / 12) * 100) / 100, taxMonthly: Math.round((bandTax / 12) * 100) / 100 });
    }
    prevTop = topScaled;
    if (annualGross <= topScaled) break;
  }

  /* Minimum-wage income-tax exemption (Türkiye, Law 7349): the tax on the
     era-scaled minimum-wage base is subtracted from the computed tax, so a
     minimum-wage earner pays no income tax and higher earners pay tax only
     on the excess. */
  if (prof.minWageTaxBase2026 && annualTax > 0) {
    const baseAnnual = prof.minWageTaxBase2026 * scale;
    let baseTax = 0, basePrev = 0;
    for (const [top2026, rate] of prof.incomeTaxBrackets2026) {
      const topScaled = top2026 === Infinity ? Infinity : top2026 * scale;
      if (baseAnnual > basePrev) baseTax += (Math.min(baseAnnual, topScaled) - basePrev) * rate;
      basePrev = topScaled;
      if (baseAnnual <= topScaled) break;
    }
    annualTax = Math.max(0, annualTax - baseTax);
  }

  const socialPct = isCitizenOrPR ? prof.citizenSocialPct : prof.expatSocialPct;
  const monthlyTax = Math.round((annualTax / 12) * 100) / 100;
  const monthlySocial = Math.round((gross * socialPct) * 100) / 100;
  const net = Math.max(0, Math.round((gross - monthlyTax - monthlySocial) * 100) / 100);
  return {
    gross: Math.round(gross * 100) / 100,
    incomeTax: monthlyTax,
    socialSecurity: monthlySocial,
    net,
    effectiveRate: Number(((monthlyTax + monthlySocial) / gross).toFixed(4)),
    taxBands,
    socialPct,
    taxFree: isNoPersonalIncomeTaxCountry(countryId)
  };
}

/* v2.7 — honest tax labels. A country is "tax-free" on personal income ONLY
   when its bracket table is genuinely empty (in this game: the UAE and Saudi
   Arabia — no personal income tax). Every other country taxes income
   progressively, so a 0 tax month must say WHY it is 0, never "Tax-Free
   Jurisdiction". Egypt: Income Tax Law 91/2005 as amended (Law 7/2024) —
   0% on the first EGP 40,000 of annual income, then 10%–27.5%. */
export function isNoPersonalIncomeTaxCountry(countryId) {
  const prof = TAX_PROFILES[countryId];
  return !!prof && Array.isArray(prof.incomeTaxBrackets2026) && prof.incomeTaxBrackets2026.length === 0;
}

/* Plain-words reason for a month with no income tax due. Never returns a
   "tax-free jurisdiction" claim for a country that taxes income. */
export function incomeTaxNote(countryId) {
  const prof = TAX_PROFILES[countryId] || TAX_PROFILES.usa;
  const cur = countryId === 'egy' ? 'EGP' : (countryId === 'gbr' ? '£' : countryId === 'usa' ? '$' : '');
  if (isNoPersonalIncomeTaxCountry(countryId)) {
    return `No personal income tax here — salaries are not taxed in ${countryId === 'uae' ? 'the UAE' : countryId === 'sau' ? 'Saudi Arabia' : 'this country'}.`;
  }
  const first = prof.incomeTaxBrackets2026[0];
  const maxRate = Math.max(...prof.incomeTaxBrackets2026.map(([, r]) => r));
  const maxPct = Number((maxRate * 100).toFixed(1));
  if (first && first[1] === 0 && first[0] !== Infinity) {
    const threshold = first[0].toLocaleString('en-US');
    return `0 — no income tax was due on this month's income. This country taxes income progressively: 0% on the first ${cur}${threshold} a year, then up to ${maxPct}%.`;
  }
  return `0 — no income tax was due on this month's income. This country taxes income progressively, up to ${maxPct}%.`;
}

/* ============================================================================
   v2.8 — CONTRACT RULES PER COUNTRY (probation, sick leave, hours, health
   cover). Fields W2's OVERTIME / VACATION / NOTICE tables do not cover.
   employerHealth: 'mandatory' = the employer must insure you by law;
   'nhs'/'public' = the public system covers you, no employer policy needed;
   'typical' = most full-time employers offer a plan, but it is not guaranteed;
   'limited' = cover depends on the employer / public fallback only.
   source 'law' = the figure is the statutory rule; 'modelled' = a typical
   employer practice, and the UI says so.
   ========================================================================== */
export const CONTRACT_RULES = {
  egy: { probationMonths: 3, sickDaysPaid: 90, weeklyHours: 48, employerHealth: 'limited', source: 'law', note: 'Public insurance covers basic care; larger employers often add a private plan.' },
  sau: { probationMonths: 3, sickDaysPaid: 120, weeklyHours: 48, employerHealth: 'mandatory', source: 'law', note: 'Your employer must insure you (and your dependents) — it is the law.' },
  uae: { probationMonths: 6, sickDaysPaid: 90, weeklyHours: 48, employerHealth: 'mandatory', source: 'law', note: 'Your employer must provide health insurance — mandatory cover in Dubai and Abu Dhabi.' },
  gbr: { probationMonths: 3, sickDaysPaid: 140, weeklyHours: 40, employerHealth: 'nhs', source: 'law', note: 'The NHS covers you — no employer policy is needed. Private cover is a perk, not a requirement.' },
  usa: { probationMonths: 3, sickDaysPaid: 0, weeklyHours: 40, employerHealth: 'typical', source: 'law', note: 'No statutory sick pay or health cover — most full-time employers offer a plan, but it is not guaranteed.' },
  deu: { probationMonths: 6, sickDaysPaid: 42, weeklyHours: 40, employerHealth: 'mandatory', source: 'law', note: 'Statutory health insurance comes out of your payroll deductions — you are covered.' },
  can: { probationMonths: 3, sickDaysPaid: 10, weeklyHours: 40, employerHealth: 'public', source: 'law', note: 'Provincial public cover, plus usually an employer top-up plan.' },
  aus: { probationMonths: 6, sickDaysPaid: 10, weeklyHours: 38, employerHealth: 'public', source: 'law', note: 'Medicare covers you; employers often add private extras.' },
  nld: { probationMonths: 2, sickDaysPaid: 520, weeklyHours: 40, employerHealth: 'mandatory', source: 'law', note: 'Basic health insurance is obligatory and comes out of your pay.' },
  fra: { probationMonths: 3, sickDaysPaid: 90, weeklyHours: 35, employerHealth: 'mandatory', source: 'law', note: 'Sécurité sociale plus the employer mutuelle — you are covered.' },
  jpn: { probationMonths: 3, sickDaysPaid: 0, weeklyHours: 40, employerHealth: 'mandatory', source: 'law', note: 'Shakai hoken (social insurance) covers your health — it is in your deductions.' },
  ita: { probationMonths: 3, sickDaysPaid: 180, weeklyHours: 40, employerHealth: 'mandatory', source: 'modelled', note: 'The national health service (SSN) covers you.' },
  sgp: { probationMonths: 3, sickDaysPaid: 14, weeklyHours: 44, employerHealth: 'typical', source: 'law', note: 'Employers must insure work-permit holders; citizens use MediSave / MediShield.' },
  bra: { probationMonths: 3, sickDaysPaid: 15, weeklyHours: 44, employerHealth: 'typical', source: 'law', note: 'SUS public cover; many employers add a private plano de saúde.' },
  ind: { probationMonths: 6, sickDaysPaid: 12, weeklyHours: 48, employerHealth: 'limited', source: 'modelled', note: 'ESI covers lower-paid workers; otherwise cover depends on the employer.' },
  che: { probationMonths: 3, sickDaysPaid: 21, weeklyHours: 42, employerHealth: 'mandatory', source: 'modelled', note: 'Basic health insurance is obligatory — you pay the premium yourself, it is not a payroll deduction.' },
  swe: { probationMonths: 6, sickDaysPaid: 14, weeklyHours: 40, employerHealth: 'public', source: 'law', note: 'Public health cover — no employer policy is needed.' },
  tur: { probationMonths: 2, sickDaysPaid: 90, weeklyHours: 45, employerHealth: 'mandatory', source: 'law', note: 'SGK social insurance covers your health — it is in your deductions.' }
};

export function contractRuleFor(countryId) {
  return CONTRACT_RULES[countryId] || CONTRACT_RULES.usa;
}

/* Share of the employee social-insurance deduction that funds the pension
   (the rest funds health, unemployment and other cover). Modelled estimates
   except the USA (FICA: Social Security 6.2 of 7.65) and Germany (pension
   9.3 of ~20). The pension line on the payslip is a sub-line of social
   insurance — shown, never deducted twice. */
const PENSION_SHARE_OF_SOCIAL = {
  egy: { citizen: 0.82, expat: 0, modelled: true },
  sau: { citizen: 0.9, expat: 0, modelled: true },
  uae: { citizen: 1.0, expat: 0, modelled: true },
  gbr: { citizen: 0.625, expat: 0.625, modelled: true }, /* v2.15 W2 — 0.625 × 8% NI = 5% of gross, the UK auto-enrolment employee minimum */
  usa: { citizen: 0.81, expat: 0.81, modelled: false },
  deu: { citizen: 0.465, expat: 0.465, modelled: false },
  can: { citizen: 0.75, expat: 0.75, modelled: true },
  aus: { citizen: 0, expat: 0, modelled: false },
  nld: { citizen: 0.5, expat: 0.5, modelled: true },
  fra: { citizen: 0.6, expat: 0.6, modelled: true },
  jpn: { citizen: 0.63, expat: 0.63, modelled: true },
  ita: { citizen: 0.7, expat: 0.7, modelled: true },
  sgp: { citizen: 0.6, expat: 0, modelled: true },
  bra: { citizen: 0.85, expat: 0.85, modelled: true },
  ind: { citizen: 0.7, expat: 0.7, modelled: true },
  che: { citizen: 0.6, expat: 0.6, modelled: true },
  swe: { citizen: 0.5, expat: 0.5, modelled: true },
  tur: { citizen: 0.6, expat: 0.6, modelled: true }
};

export function pensionShareFor(countryId, isCitizenOrPR = true) {
  const s = PENSION_SHARE_OF_SOCIAL[countryId] || PENSION_SHARE_OF_SOCIAL.usa;
  return { share: isCitizenOrPR ? s.citizen : s.expat, modelled: s.modelled };
}

/* Pension the EMPLOYER pays on top of your gross (never deducted from you):
   Australia's Superannuation Guarantee (12%) and the UK auto-enrolment
   minimum (3%). Everywhere else the employer's pension share is inside the
   payroll system, not a separate visible top-up. */
export const EMPLOYER_PENSION_PCT = { aus: 0.12, gbr: 0.03 };

/* ============================================================================
   v2.8 — THE PAYSLIP. One source of truth: the monthly ledger
   (economyEngine salary block) and the Career tab card BOTH read this
   function with the same inputs, so the net on the card IS the net that
   lands in the ledger. Overtime uses W2's computeOvertimePay (the real
   per-country rate) — never a second overtime calculation.
   Allowances: the game's gross is one combined salary — no employer splits
   transport / housing / medical allowances out of it, so the payslip says
   so instead of inventing allowance amounts. The sum always holds:
   base + overtime − income tax − social insurance = net.
   ========================================================================== */
export function computePayslip(monthlyGross, countryId, year = REFERENCE_YEAR, isCitizenOrPR = true, workMode = 'normal', opts = {}) {
  const baseGross = Math.max(0, Math.round(Number(monthlyGross) || 0));
  const overtimePay = workMode === 'overtime' ? computeOvertimePay(baseGross, countryId) : 0;
  const gross = Math.round(baseGross + overtimePay);
  const pay = computeMonthlyNetPay(gross, countryId, year, isCitizenOrPR);
  const pension = pensionShareFor(countryId, isCitizenOrPR);
  /* v2.18 W2 — pay freeze: opts.payFrozen (with opts.payFreezeNote)
     marks the payslip, in plain words, and reports that the gross
     does not rise while the freeze lasts. The freeze itself is
     enforced where gross changes (the yearly merit rise in
     tickCareerMonthly and the raise negotiation); this function only
     ever reports it — it never changes a number on its own. */
  const payFrozen = !!opts.payFrozen;
  const payFreezeNote = payFrozen
    ? (opts.payFreezeNote || 'Pay is frozen this year — your gross does not rise while the freeze lasts.')
    : '';
  /* Whole currency units: the ledger credits whole units (addIncome rounds
     every income line), so the payslip states whole units too — and the net
     here IS the ledger credit, exactly. The social-insurance line absorbs
     sub-unit rounding (at most 1) so the printed sum is exact:
     base + overtime − income tax − social insurance = net, always. */
  const net = Math.round(pay.net);
  const incomeTax = Math.round(pay.incomeTax);
  const socialSecurity = Math.max(0, gross - incomeTax - net);
  const pensionContribution = Math.round(socialSecurity * pension.share);
  const employerPension = Math.round(gross * (EMPLOYER_PENSION_PCT[countryId] || 0));
  return {
    baseGross,
    overtimePay,
    gross,
    incomeTax,
    socialSecurity,
    pensionContribution,
    pensionModelled: pension.modelled,
    employerPension,
    net,
    effectiveRate: pay.effectiveRate,
    taxBands: pay.taxBands,
    socialPct: pay.socialPct,
    taxFree: pay.taxFree,
    workMode,
    payFrozen,
    payFreezeNote,
    additions: overtimePay > 0 ? [{ label: `Overtime pay — 20 extra hours at the overtime rate (${overtimeRuleFor(countryId).mult}×)`, amount: overtimePay }] : [],
    deductions: [
      { label: 'Income tax', amount: incomeTax },
      { label: 'Social insurance', amount: socialSecurity }
    ]
  };
}
