const players = [
    // =========================
    //         QUARTERBACKS
    // =========================
  
    {
      id: 1,
      name: "Josh Allen",
      position: "QB",
      team: "Buffalo Bills",
      color: "#00338D",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3918298.png",
  
      fantasy: {
        ppg: 25.4,
        consistency: 0.72,
        boomRate: 0.34,
        bustRate: 0.10,
      },
  
      passing: {
        yards: 4450,
        tds: 33,
        ints: 15,
        airYards: 4800,
        bigTimeThrows: 31,
        turnoverWorthyPlays: 20,
      },
  
      rushing: {
        yards: 560,
        tds: 9,
        scrambles: 32,
        designedRuns: 39,
      },
  
      advanced: {
        successRate: 0.51,
        pressureRate: 0.28,
        epaPerPlay: 0.19,
        cpoe: 0.021,
        pacr: 1.11,
        yac: 1820,
      },
  
      trends: {
        last5GamesPPG: [27.5, 22.4, 30.9, 25.1, 21.7],
        projectedNextWeek: 24.9,
        hotStreak: true,
      }
    },
  
    {
      id: 2,
      name: "Patrick Mahomes",
      position: "QB",
      team: "Kansas City Chiefs",
      color: "#E31837",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3139477.png",
  
      fantasy: {
        ppg: 24.8,
        consistency: 0.70,
        boomRate: 0.31,
        bustRate: 0.12,
      },
  
      passing: {
        yards: 4680,
        tds: 34,
        ints: 12,
        airYards: 5180,
        bigTimeThrows: 33,
        turnoverWorthyPlays: 17,
      },
  
      rushing: {
        yards: 340,
        tds: 2,
        scrambles: 24,
        designedRuns: 16,
      },
  
      advanced: {
        successRate: 0.53,
        pressureRate: 0.23,
        epaPerPlay: 0.17,
        cpoe: 0.019,
        pacr: 1.18,
        yac: 2070,
      },
  
      trends: {
        last5GamesPPG: [26.2, 20.1, 29.0, 19.8, 27.3],
        projectedNextWeek: 24.3,
        hotStreak: false,
      }
    },
  
    {
      id: 3,
      name: "Lamar Jackson",
      position: "QB",
      team: "Baltimore Ravens",
      color: "#241773",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3916387.png",
  
      fantasy: {
        ppg: 24.1,
        consistency: 0.69,
        boomRate: 0.30,
        bustRate: 0.09,
      },
  
      passing: {
        yards: 3455,
        tds: 23,
        ints: 10,
        airYards: 3620,
        bigTimeThrows: 24,
        turnoverWorthyPlays: 13,
      },
  
      rushing: {
        yards: 890,
        tds: 6,
        scrambles: 49,
        designedRuns: 63,
      },
  
      advanced: {
        successRate: 0.49,
        pressureRate: 0.30,
        epaPerPlay: 0.15,
        cpoe: 0.012,
        pacr: 1.07,
        yac: 1540,
      },
  
      trends: {
        last5GamesPPG: [22.7, 29.1, 18.8, 23.7, 26.2],
        projectedNextWeek: 23.6,
        hotStreak: true,
      }
    },
  
    {
      id: 4,
      name: "Jalen Hurts",
      position: "QB",
      team: "Philadelphia Eagles",
      color: "#004C54",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4040715.png",
  
      fantasy: {
        ppg: 23.8,
        consistency: 0.67,
        boomRate: 0.27,
        bustRate: 0.13,
      },
  
      passing: {
        yards: 3680,
        tds: 25,
        ints: 12,
        airYards: 4010,
        bigTimeThrows: 22,
        turnoverWorthyPlays: 18,
      },
  
      rushing: {
        yards: 780,
        tds: 11,
        scrambles: 39,
        designedRuns: 56,
      },
  
      advanced: {
        successRate: 0.48,
        pressureRate: 0.26,
        epaPerPlay: 0.13,
        cpoe: -0.010,
        pacr: 1.04,
        yac: 1480,
      },
  
      trends: {
        last5GamesPPG: [20.5, 18.4, 27.1, 23.2, 28.0],
        projectedNextWeek: 22.7,
        hotStreak: false,
      }
    },
  
    {
      id: 5,
      name: "C.J. Stroud",
      position: "QB",
      team: "Houston Texans",
      color: "#03202F",
      photo: "//a.espncdn.com/i/headshots/nfl/players/full/4432577.png",
  
      fantasy: {
        ppg: 22.9,
        consistency: 0.66,
        boomRate: 0.26,
        bustRate: 0.12,
      },
  
      passing: {
        yards: 4360,
        tds: 29,
        ints: 9,
        airYards: 4750,
        bigTimeThrows: 30,
        turnoverWorthyPlays: 14,
      },
  
      rushing: {
        yards: 190,
        tds: 3,
        scrambles: 17,
        designedRuns: 10,
      },
  
      advanced: {
        successRate: 0.51,
        pressureRate: 0.22,
        epaPerPlay: 0.21,
        cpoe: 0.018,
        pacr: 1.12,
        yac: 1620,
      },
  
      trends: {
        last5GamesPPG: [23.9, 20.2, 25.3, 19.0, 24.4],
        projectedNextWeek: 22.8,
        hotStreak: true,
      }
    },
  
    // =========================
    //      RUNNING BACKS
    // =========================
  
    {
      id: 6,
      name: "Christian McCaffrey",
      position: "RB",
      team: "San Francisco 49ers",
      color: "#AA0000",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3117251.png",
  
      fantasy: {
        ppg: 24.1,
        consistency: 0.79,
        boomRate: 0.27,
        bustRate: 0.04,
      },
  
      rushing: {
        yards: 1330,
        tds: 13,
        yardsAfterContact: 680,
        brokenTackles: 21,
      },
  
      receiving: {
        receptions: 67,
        recYards: 660,
        recTD: 5,
        targetShare: 0.18,
      },
  
      advanced: {
        successRate: 0.53,
        snapShare: 0.71,
        epaPerPlay: 0.20,
        yac: 560,
      },
  
      trends: {
        last5GamesPPG: [21.4, 26.1, 18.9, 24.8, 22.7],
        projectedNextWeek: 23.9,
        hotStreak: true,
      }
    },
  
    {
      id: 7,
      name: "Bijan Robinson",
      position: "RB",
      team: "Atlanta Falcons",
      color: "#A71930",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4430807.png",
  
      fantasy: {
        ppg: 19.6,
        consistency: 0.67,
        boomRate: 0.24,
        bustRate: 0.10,
      },
  
      rushing: {
        yards: 1120,
        tds: 7,
        yardsAfterContact: 490,
        brokenTackles: 19,
      },
  
      receiving: {
        receptions: 59,
        recYards: 515,
        recTD: 2,
        targetShare: 0.16,
      },
  
      advanced: {
        successRate: 0.48,
        snapShare: 0.64,
        epaPerPlay: 0.13,
        yac: 420,
      },
  
      trends: {
        last5GamesPPG: [17.8, 23.1, 20.4, 14.7, 22.9],
        projectedNextWeek: 19.4,
        hotStreak: false,
      }
    },
  
    {
      id: 8,
      name: "Breece Hall",
      position: "RB",
      team: "New York Jets",
      color: "#125740",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4427366.png",
  
      fantasy: {
        ppg: 19.3,
        consistency: 0.65,
        boomRate: 0.22,
        bustRate: 0.11,
      },
  
      rushing: {
        yards: 1010,
        tds: 6,
        yardsAfterContact: 480,
        brokenTackles: 18,
      },
  
      receiving: {
        receptions: 58,
        recYards: 500,
        recTD: 3,
        targetShare: 0.14,
      },
  
      advanced: {
        successRate: 0.47,
        snapShare: 0.63,
        epaPerPlay: 0.12,
        yac: 390,
      },
  
      trends: {
        last5GamesPPG: [16.1, 20.9, 18.7, 14.4, 23.8],
        projectedNextWeek: 18.8,
        hotStreak: false,
      }
    },
  
    {
      id: 9,
      name: "Saquon Barkley",
      position: "RB",
      team: "Philadelphia Eagles",
      color: "#004C54",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3929630.png",
  
      fantasy: {
        ppg: 17.8,
        consistency: 0.61,
        boomRate: 0.20,
        bustRate: 0.15,
      },
  
      rushing: {
        yards: 1080,
        tds: 8,
        yardsAfterContact: 500,
        brokenTackles: 17,
      },
  
      receiving: {
        receptions: 51,
        recYards: 380,
        recTD: 2,
        targetShare: 0.13,
      },
  
      advanced: {
        successRate: 0.45,
        snapShare: 0.61,
        epaPerPlay: 0.10,
        yac: 350,
      },
  
      trends: {
        last5GamesPPG: [14.0, 19.3, 20.1, 12.5, 17.8],
        projectedNextWeek: 17.4,
        hotStreak: false,
      }
    },
  
    {
      id: 10,
      name: "Kyren Williams",
      position: "RB",
      team: "Los Angeles Rams",
      color: "#003594",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4430737.png",
  
      fantasy: {
        ppg: 18.4,
        consistency: 0.68,
        boomRate: 0.23,
        bustRate: 0.09,
      },
  
      rushing: {
        yards: 1160,
        tds: 10,
        yardsAfterContact: 510,
        brokenTackles: 15,
      },
  
      receiving: {
        receptions: 42,
        recYards: 338,
        recTD: 3,
        targetShare: 0.11,
      },
  
      advanced: {
        successRate: 0.49,
        snapShare: 0.73,
        epaPerPlay: 0.14,
        yac: 380,
      },
  
      trends: {
        last5GamesPPG: [19.4, 22.2, 15.9, 18.0, 16.5],
        projectedNextWeek: 18.3,
        hotStreak: true,
      }
    },
  
    // =========================
    //      WIDE RECEIVERS
    // =========================
  
    {
      id: 11,
      name: "Tyreek Hill",
      position: "WR",
      team: "Miami Dolphins",
      color: "#008E97",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3116406.png",
  
      fantasy: {
        ppg: 24.3,
        consistency: 0.73,
        boomRate: 0.40,
        bustRate: 0.06,
      },
  
      receiving: {
        receptions: 117,
        recYards: 1750,
        recTD: 12,
        airYards: 2140,
        targetShare: 0.31,
        yac: 690,
      },
  
      advanced: {
        contestedCatchRate: 0.44,
        routeWinRate: 0.57,
        epaPerPlay: 0.26,
      },
  
      trends: {
        last5GamesPPG: [21.7, 29.8, 27.4, 19.1, 22.5],
        projectedNextWeek: 24.8,
        hotStreak: true,
      }
    },
  
    {
      id: 12,
      name: "Amon-Ra St. Brown",
      position: "WR",
      team: "Detroit Lions",
      color: "#0076B6",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4374302.png",
  
      fantasy: {
        ppg: 21.5,
        consistency: 0.70,
        boomRate: 0.34,
        bustRate: 0.10,
      },
  
      receiving: {
        receptions: 114,
        recYards: 1460,
        recTD: 9,
        airYards: 1700,
        targetShare: 0.28,
        yac: 420,
      },
  
      advanced: {
        contestedCatchRate: 0.49,
        routeWinRate: 0.53,
        epaPerPlay: 0.21,
      },
  
      trends: {
        last5GamesPPG: [22.2, 18.7, 21.3, 25.0, 20.1],
        projectedNextWeek: 21.2,
        hotStreak: false,
      }
    },
  
    {
      id: 13,
      name: "CeeDee Lamb",
      position: "WR",
      team: "Dallas Cowboys",
      color: "#041E42",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4241389.png",
  
      fantasy: {
        ppg: 22.1,
        consistency: 0.69,
        boomRate: 0.36,
        bustRate: 0.08,
      },
  
      receiving: {
        receptions: 122,
        recYards: 1620,
        recTD: 12,
        airYards: 1900,
        targetShare: 0.30,
        yac: 460,
      },
  
      advanced: {
        contestedCatchRate: 0.42,
        routeWinRate: 0.55,
        epaPerPlay: 0.23,
      },
  
      trends: {
        last5GamesPPG: [23.8, 25.1, 19.7, 21.4, 26.2],
        projectedNextWeek: 23.0,
        hotStreak: true,
      }
    },
  
    {
      id: 14,
      name: "A.J. Brown",
      position: "WR",
      team: "Philadelphia Eagles",
      color: "#004C54",
      photo: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/a014sgzctarbvhwb35lw",
  
      fantasy: {
        ppg: 20.4,
        consistency: 0.65,
        boomRate: 0.32,
        bustRate: 0.12,
      },
  
      receiving: {
        receptions: 108,
        recYards: 1510,
        recTD: 8,
        airYards: 2080,
        targetShare: 0.27,
        yac: 380,
      },
  
      advanced: {
        contestedCatchRate: 0.48,
        routeWinRate: 0.51,
        epaPerPlay: 0.20,
      },
  
      trends: {
        last5GamesPPG: [18.1, 21.0, 19.5, 23.7, 20.0],
        projectedNextWeek: 20.6,
        hotStreak: false,
      }
    },
  
    {
      id: 15,
      name: "Puka Nacua",
      position: "WR",
      team: "Los Angeles Rams",
      color: "#003594",
      photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4426515.png",
  
      fantasy: {
        ppg: 19.4,
        consistency: 0.62,
        boomRate: 0.29,
        bustRate: 0.13,
      },
  
      receiving: {
        receptions: 104,
        recYards: 1380,
        recTD: 7,
        airYards: 1850,
        targetShare: 0.26,
        yac: 510,
      },
  
      advanced: {
        contestedCatchRate: 0.40,
        routeWinRate: 0.52,
        epaPerPlay: 0.19,
      },
  
      trends: {
        last5GamesPPG: [17.2, 20.8, 19.9, 15.3, 22.4],
        projectedNextWeek: 19.1,
        hotStreak: true,
      }
    },
    {
        id: 16,
        name: "Caleb Williams",
        position: "QB",
        team: "Chicago Bears",
        color: "#0B162A",   // Bears navy blue
      
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4431611.png",
      
        fantasy: {
          ppg: 19.4,           // realistic projection
          consistency: 0.61,
          boomRate: 0.28,
          bustRate: 0.15,
        },
      
        passing: {
          yards: 4120,
          tds: 27,
          ints: 11,
          completion: 0.66,
          airYards: 4600,
        },
      
        rushing: {
          yards: 415,
          tds: 3,
        },
      
        advanced: {
          epaPerPlay: 0.15,
          cpoe: 0.024,
          pressureEscapeRate: 0.31,
          bigTimeThrowRate: 0.065,
        },
      
        trends: {
          last5GamesPPG: [18.2, 21.1, 19.7, 20.3, 17.8],
          projectedNextWeek: 20.5,
          hotStreak: false,
        }
      },
      
    
      {
        id: 18,
        name: "Ja'Marr Chase",
        position: "WR",
        team: "Cincinnati Bengals",
        color: "#FB4F14",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4362628.png",
    
        fantasy: {
          ppg: 19.5,
          consistency: 0.66,
          boomRate: 0.33,
          bustRate: 0.13,
        },
    
        receiving: {
          receptions: 98,
          recYards: 1410,
          recTD: 10,
          airYards: 1930,
          targetShare: 0.28,
          yac: 520,
        },
    
        advanced: {
          contestedCatchRate: 0.46,
          routeWinRate: 0.52,
          epaPerPlay: 0.20,
        },
    
        trends: {
          last5GamesPPG: [20.1, 22.9, 18.3, 24.2, 23.7],
          projectedNextWeek: 20.8,
          hotStreak: true,
        }
      },
    
      {
        id: 19,
        name: "Justin Jefferson",
        position: "WR",
        team: "Minnesota Vikings",
        color: "#4F2683",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4262921.png",
    
        fantasy: {
          ppg: 20.7,
          consistency: 0.67,
          boomRate: 0.32,
          bustRate: 0.11,
        },
    
        receiving: {
          receptions: 112,
          recYards: 1580,
          recTD: 8,
          airYards: 1980,
          targetShare: 0.29,
          yac: 430,
        },
    
        advanced: {
          contestedCatchRate: 0.50,
          routeWinRate: 0.54,
          epaPerPlay: 0.22,
        },
    
        trends: {
          last5GamesPPG: [22.7, 18.4, 19.8, 21.1, 20.3],
          projectedNextWeek: 20.9,
          hotStreak: false,
        }
      },
    
      {
        id: 20,
        name: "Deebo Samuel",
        position: "WR",
        team: "San Francisco 49ers",
        color: "#AA0000",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3126486.png",
    
        fantasy: {
          ppg: 17.3,
          consistency: 0.61,
          boomRate: 0.27,
          bustRate: 0.16,
        },
    
        receiving: {
          receptions: 78,
          recYards: 1040,
          recTD: 7,
          airYards: 1400,
          targetShare: 0.21,
          yac: 540,
        },
    
        advanced: {
          contestedCatchRate: 0.38,
          routeWinRate: 0.49,
          epaPerPlay: 0.18,
        },
    
        trends: {
          last5GamesPPG: [15.0, 18.3, 21.7, 14.4, 17.1],
          projectedNextWeek: 17.4,
          hotStreak: true,
        }
      },
    
      // ==============================
      //           MORE RBs
      // ==============================
    
      {
        id: 21,
        name: "Jahmyr Gibbs",
        position: "RB",
        team: "Detroit Lions",
        color: "#0076B6",
        photo: "https://static.www.nfl.com/image/upload/t_player_profile_landscape/league/hjxk3judytgsxkqiilre",
    
        fantasy: {
          ppg: 17.5,
          consistency: 0.63,
          boomRate: 0.25,
          bustRate: 0.14,
        },
    
        rushing: {
          yards: 940,
          tds: 8,
          yardsAfterContact: 420,
          brokenTackles: 14,
        },
    
        receiving: {
          receptions: 52,
          recYards: 430,
          recTD: 3,
          targetShare: 0.14,
        },
    
        advanced: {
          successRate: 0.46,
          snapShare: 0.58,
          epaPerPlay: 0.12,
          yac: 360,
        },
    
        trends: {
          last5GamesPPG: [17.9, 16.4, 18.7, 14.0, 20.3],
          projectedNextWeek: 17.6,
          hotStreak: true,
        }
      },
    
      {
        id: 22,
        name: "Travis Etienne",
        position: "RB",
        team: "Jacksonville Jaguars",
        color: "#006778",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4239996.png",
    
        fantasy: {
          ppg: 16.8,
          consistency: 0.59,
          boomRate: 0.22,
          bustRate: 0.17,
        },
    
        rushing: {
          yards: 1040,
          tds: 8,
          yardsAfterContact: 470,
          brokenTackles: 16,
        },
    
        receiving: {
          receptions: 48,
          recYards: 350,
          recTD: 2,
          targetShare: 0.12,
        },
    
        advanced: {
          successRate: 0.45,
          snapShare: 0.67,
          epaPerPlay: 0.10,
          yac: 330,
        },
    
        trends: {
          last5GamesPPG: [15.1, 17.2, 18.8, 13.9, 19.0],
          projectedNextWeek: 16.3,
          hotStreak: false,
        }
      },
    
      {
        id: 23,
        name: "Isiah Pacheco",
        position: "RB",
        team: "Kansas City Chiefs",
        color: "#E31837",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4361529.png",
    
        fantasy: {
          ppg: 15.9,
          consistency: 0.60,
          boomRate: 0.19,
          bustRate: 0.18,
        },
    
        rushing: {
          yards: 985,
          tds: 7,
          yardsAfterContact: 430,
          brokenTackles: 13,
        },
    
        receiving: {
          receptions: 38,
          recYards: 296,
          recTD: 2,
          targetShare: 0.09,
        },
    
        advanced: {
          successRate: 0.44,
          snapShare: 0.62,
          epaPerPlay: 0.09,
          yac: 300,
        },
    
        trends: {
          last5GamesPPG: [14.0, 16.7, 17.3, 18.2, 15.4],
          projectedNextWeek: 15.8,
          hotStreak: true,
        }
      },
    
      {
        id: 24,
        name: "Rachaad White",
        position: "RB",
        team: "Tampa Bay Buccaneers",
        color: "#D50A0A",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4697815.png",
    
        fantasy: {
          ppg: 15.7,
          consistency: 0.61,
          boomRate: 0.20,
          bustRate: 0.17,
        },
    
        rushing: {
          yards: 920,
          tds: 6,
          yardsAfterContact: 410,
          brokenTackles: 12,
        },
    
        receiving: {
          receptions: 57,
          recYards: 420,
          recTD: 2,
          targetShare: 0.15,
        },
    
        advanced: {
          successRate: 0.44,
          snapShare: 0.69,
          epaPerPlay: 0.11,
          yac: 310,
        },
    
        trends: {
          last5GamesPPG: [14.8, 16.1, 17.0, 13.2, 17.5],
          projectedNextWeek: 15.5,
          hotStreak: false,
        }
      },
    
      {
        id: 25,
        name: "David Montgomery",
        position: "RB",
        team: "Detroit Lions",
        color: "#0076B6",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4035538.png",
    
        fantasy: {
          ppg: 14.1,
          consistency: 0.55,
          boomRate: 0.18,
          bustRate: 0.19,
        },
    
        rushing: {
          yards: 960,
          tds: 10,
          yardsAfterContact: 450,
          brokenTackles: 14,
        },
    
        receiving: {
          receptions: 31,
          recYards: 255,
          recTD: 1,
          targetShare: 0.07,
        },
    
        advanced: {
          successRate: 0.45,
          snapShare: 0.56,
          epaPerPlay: 0.12,
          yac: 290,
        },
    
        trends: {
          last5GamesPPG: [13.2, 15.4, 14.5, 12.9, 14.8],
          projectedNextWeek: 14.0,
          hotStreak: true,
        }
      },
    
      // ==========================
      //        TIGHT ENDS
      // ==========================
    
      {
        id: 26,
        name: "Travis Kelce",
        position: "TE",
        team: "Kansas City Chiefs",
        color: "#E31837",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/15847.png",
    
        fantasy: {
          ppg: 17.1,
          consistency: 0.71,
          boomRate: 0.20,
          bustRate: 0.10,
        },
    
        receiving: {
          receptions: 91,
          recYards: 1035,
          recTD: 8,
          airYards: 1290,
          targetShare: 0.22,
          yac: 392,
        },
    
        advanced: {
          contestedCatchRate: 0.44,
          routeWinRate: 0.53,
          epaPerPlay: 0.16,
        },
    
        trends: {
          last5GamesPPG: [15.2, 18.7, 14.2, 19.3, 16.8],
          projectedNextWeek: 17.2,
          hotStreak: false,
        }
      },
    
      {
        id: 27,
        name: "Sam LaPorta",
        position: "TE",
        team: "Detroit Lions",
        color: "#0076B6",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4430027.png",
    
        fantasy: {
          ppg: 15.2,
          consistency: 0.69,
          boomRate: 0.18,
          bustRate: 0.11,
        },
    
        receiving: {
          receptions: 82,
          recYards: 915,
          recTD: 7,
          airYards: 1185,
          targetShare: 0.21,
          yac: 372,
        },
    
        advanced: {
          contestedCatchRate: 0.44,
          routeWinRate: 0.49,
          epaPerPlay: 0.15,
        },
    
        trends: {
          last5GamesPPG: [14.1, 17.3, 13.5, 16.6, 15.8],
          projectedNextWeek: 15.3,
          hotStreak: true,
        }
      },
    
      {
        id: 28,
        name: "Trey McBride",
        position: "TE",
        team: "Arizona Cardinals",
        color: "#97233F",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4361307.png",
    
        fantasy: {
          ppg: 14.0,
          consistency: 0.67,
          boomRate: 0.17,
          bustRate: 0.12,
        },
    
        receiving: {
          receptions: 76,
          recYards: 848,
          recTD: 6,
          airYards: 1130,
          targetShare: 0.20,
          yac: 310,
        },
    
        advanced: {
          contestedCatchRate: 0.42,
          routeWinRate: 0.47,
          epaPerPlay: 0.14,
        },
    
        trends: {
          last5GamesPPG: [12.9, 15.1, 14.5, 13.2, 16.0],
          projectedNextWeek: 14.1,
          hotStreak: false,
        }
      },
    
      {
        id: 29,
        name: "George Kittle",
        position: "TE",
        team: "San Francisco 49ers",
        color: "#AA0000",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3040151.png",
    
        fantasy: {
          ppg: 13.7,
          consistency: 0.64,
          boomRate: 0.18,
          bustRate: 0.14,
        },
    
        receiving: {
          receptions: 72,
          recYards: 940,
          recTD: 6,
          airYards: 1200,
          targetShare: 0.18,
          yac: 400,
        },
    
        advanced: {
          contestedCatchRate: 0.41,
          routeWinRate: 0.48,
          epaPerPlay: 0.15,
        },
    
        trends: {
          last5GamesPPG: [13.5, 14.8, 11.7, 16.1, 13.0],
          projectedNextWeek: 13.8,
          hotStreak: false,
        }
      },
    
      {
        id: 30,
        name: "Mark Andrews",
        position: "TE",
        team: "Baltimore Ravens",
        color: "#241773",
        photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3116365.png",
    
        fantasy: {
          ppg: 13.3,
          consistency: 0.63,
          boomRate: 0.17,
          bustRate: 0.15,
        },
    
        receiving: {
          receptions: 68,
          recYards: 860,
          recTD: 7,
          airYards: 1100,
          targetShare: 0.20,
          yac: 330,
        },
    
        advanced: {
          contestedCatchRate: 0.43,
          routeWinRate: 0.47,
          epaPerPlay: 0.14,
        },
    
        trends: {
          last5GamesPPG: [13.1, 15.0, 12.8, 14.7, 13.2],
          projectedNextWeek: 13.4,
          hotStreak: true,
        }
      },
  // ==========================
  //      MORE WIDE RECEIVERS
  // ==========================

  {
    id: 31,
    name: "Stefon Diggs",
    position: "WR",
    team: "Houston Texans",
    color: "#03202F",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/2976212.png",

    fantasy: {
      ppg: 17.8,
      consistency: 0.63,
      boomRate: 0.26,
      bustRate: 0.14,
    },

    receiving: {
      receptions: 95,
      recYards: 1180,
      recTD: 9,
      airYards: 1540,
      targetShare: 0.25,
      yac: 350,
    },

    advanced: {
      contestedCatchRate: 0.40,
      routeWinRate: 0.50,
      epaPerPlay: 0.18,
    },

    trends: {
      last5GamesPPG: [16.1, 20.2, 18.7, 15.4, 18.9],
      projectedNextWeek: 17.6,
      hotStreak: false,
    }
  },

  {
    id: 32,
    name: "DeVonta Smith",
    position: "WR",
    team: "Philadelphia Eagles",
    color: "#004C54",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4241478.png",

    fantasy: {
      ppg: 15.9,
      consistency: 0.62,
      boomRate: 0.24,
      bustRate: 0.17,
    },

    receiving: {
      receptions: 85,
      recYards: 1100,
      recTD: 7,
      airYards: 1500,
      targetShare: 0.21,
      yac: 330,
    },

    advanced: {
      contestedCatchRate: 0.38,
      routeWinRate: 0.48,
      epaPerPlay: 0.16,
    },

    trends: {
      last5GamesPPG: [14.7, 18.4, 13.9, 17.5, 15.2],
      projectedNextWeek: 15.6,
      hotStreak: true,
    }
  },

  {
    id: 33,
    name: "Brandon Aiyuk",
    position: "WR",
    team: "San Francisco 49ers",
    color: "#AA0000",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4360438.png",

    fantasy: {
      ppg: 16.3,
      consistency: 0.61,
      boomRate: 0.26,
      bustRate: 0.16,
    },

    receiving: {
      receptions: 82,
      recYards: 1310,
      recTD: 7,
      airYards: 1700,
      targetShare: 0.22,
      yac: 410,
    },

    advanced: {
      contestedCatchRate: 0.41,
      routeWinRate: 0.49,
      epaPerPlay: 0.17,
    },

    trends: {
      last5GamesPPG: [15.4, 17.6, 18.7, 14.0, 16.9],
      projectedNextWeek: 16.1,
      hotStreak: false,
    }
  },

  {
    id: 34,
    name: "DJ Moore",
    position: "WR",
    team: "Chicago Bears",
    color: "#0B162A",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3915416.png",

    fantasy: {
      ppg: 16.9,
      consistency: 0.64,
      boomRate: 0.27,
      bustRate: 0.15,
    },

    receiving: {
      receptions: 88,
      recYards: 1250,
      recTD: 8,
      airYards: 1680,
      targetShare: 0.26,
      yac: 450,
    },

    advanced: {
      contestedCatchRate: 0.39,
      routeWinRate: 0.50,
      epaPerPlay: 0.18,
    },

    trends: {
      last5GamesPPG: [17.0, 19.1, 15.8, 14.9, 18.6],
      projectedNextWeek: 17.2,
      hotStreak: true,
    }
  },

  {
    id: 35,
    name: "Mike Evans",
    position: "WR",
    team: "Tampa Bay Buccaneers",
    color: "#D50A0A",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/16737.png",

    fantasy: {
      ppg: 16.4,
      consistency: 0.60,
      boomRate: 0.27,
      bustRate: 0.15,
    },

    receiving: {
      receptions: 76,
      recYards: 1230,
      recTD: 11,
      airYards: 1810,
      targetShare: 0.23,
      yac: 290,
    },

    advanced: {
      contestedCatchRate: 0.52,
      routeWinRate: 0.47,
      epaPerPlay: 0.17,
    },

    trends: {
      last5GamesPPG: [16.1, 18.9, 17.4, 14.9, 16.0],
      projectedNextWeek: 16.3,
      hotStreak: true,
    }
  },

  // ==========================
  //       MORE QBs
  // ==========================

  {
    id: 36,
    name: "Joe Burrow",
    position: "QB",
    team: "Cincinnati Bengals",
    color: "#FB4F14",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3915511.png",

    fantasy: {
      ppg: 20.4,
      consistency: 0.64,
      boomRate: 0.27,
      bustRate: 0.14,
    },

    passing: {
      yards: 4380,
      tds: 30,
      ints: 11,
      airYards: 4800,
      bigTimeThrows: 29,
      turnoverWorthyPlays: 16,
    },

    rushing: {
      yards: 220,
      tds: 2,
      scrambles: 23,
      designedRuns: 9,
    },

    advanced: {
      successRate: 0.50,
      pressureRate: 0.23,
      epaPerPlay: 0.17,
      cpoe: 0.013,
      pacr: 1.09,
      yac: 1600,
    },

    trends: {
      last5GamesPPG: [19.0, 21.4, 23.1, 18.9, 20.5],
      projectedNextWeek: 20.3,
      hotStreak: true,
    }
  },

  {
    id: 37,
    name: "Dak Prescott",
    position: "QB",
    team: "Dallas Cowboys",
    color: "#041E42",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/2577417.png",

    fantasy: {
      ppg: 20.8,
      consistency: 0.63,
      boomRate: 0.28,
      bustRate: 0.13,
    },

    passing: {
      yards: 4520,
      tds: 32,
      ints: 10,
      airYards: 4700,
      bigTimeThrows: 28,
      turnoverWorthyPlays: 14,
    },

    rushing: {
      yards: 215,
      tds: 3,
      scrambles: 22,
      designedRuns: 12,
    },

    advanced: {
      successRate: 0.52,
      pressureRate: 0.24,
      epaPerPlay: 0.18,
      cpoe: 0.015,
      pacr: 1.10,
      yac: 1500,
    },

    trends: {
      last5GamesPPG: [21.4, 22.9, 19.0, 23.3, 20.2],
      projectedNextWeek: 20.7,
      hotStreak: false,
    }
  },

  // ==========================
  //        MORE WRs
  // ==========================

  {
    id: 38,
    name: "Tee Higgins",
    position: "WR",
    team: "Cincinnati Bengals",
    color: "#FB4F14",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4239993.png",

    fantasy: {
      ppg: 14.3,
      consistency: 0.55,
      boomRate: 0.20,
      bustRate: 0.18,
    },

    receiving: {
      receptions: 76,
      recYards: 1050,
      recTD: 7,
      airYards: 1420,
      targetShare: 0.18,
      yac: 320,
    },

    advanced: {
      contestedCatchRate: 0.47,
      routeWinRate: 0.46,
      epaPerPlay: 0.14,
    },

    trends: {
      last5GamesPPG: [12.8, 15.5, 14.1, 16.8, 13.7],
      projectedNextWeek: 14.2,
      hotStreak: true,
    }
  },

  {
    id: 39,
    name: "Michael Pittman Jr.",
    position: "WR",
    team: "Indianapolis Colts",
    color: "#002C5F",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4035687.png",

    fantasy: {
      ppg: 15.1,
      consistency: 0.61,
      boomRate: 0.23,
      bustRate: 0.15,
    },

    receiving: {
      receptions: 102,
      recYards: 1180,
      recTD: 5,
      airYards: 1540,
      targetShare: 0.27,
      yac: 350,
    },

    advanced: {
      contestedCatchRate: 0.41,
      routeWinRate: 0.48,
      epaPerPlay: 0.16,
    },

    trends: {
      last5GamesPPG: [14.0, 17.4, 15.9, 16.1, 14.7],
      projectedNextWeek: 15.2,
      hotStreak: false,
    }
  },

  {
    id: 40,
    name: "Tank Dell",
    position: "WR",
    team: "Houston Texans",
    color: "#03202F",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4366031.png",

    fantasy: {
      ppg: 15.8,
      consistency: 0.58,
      boomRate: 0.31,
      bustRate: 0.14,
    },

    receiving: {
      receptions: 71,
      recYards: 1050,
      recTD: 8,
      airYards: 1500,
      targetShare: 0.20,
      yac: 280,
    },

    advanced: {
      contestedCatchRate: 0.39,
      routeWinRate: 0.51,
      epaPerPlay: 0.17,
    },

    trends: {
      last5GamesPPG: [16.1, 18.3, 14.9, 17.2, 15.8],
      projectedNextWeek: 15.7,
      hotStreak: true,
    }
  },

  // ==========================
  //        MORE RBs
  // ==========================

  {
    id: 41,
    name: "James Cook",
    position: "RB",
    team: "Buffalo Bills",
    color: "#00338D",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4379399.png",

    fantasy: {
      ppg: 15.2,
      consistency: 0.60,
      boomRate: 0.21,
      bustRate: 0.18,
    },

    rushing: {
      yards: 1120,
      tds: 5,
      yardsAfterContact: 430,
      brokenTackles: 14,
    },

    receiving: {
      receptions: 54,
      recYards: 420,
      recTD: 2,
      targetShare: 0.13,
    },

    advanced: {
      successRate: 0.46,
      snapShare: 0.62,
      epaPerPlay: 0.11,
      yac: 350,
    },

    trends: {
      last5GamesPPG: [13.4, 17.0, 15.3, 14.9, 16.2],
      projectedNextWeek: 15.0,
      hotStreak: false,
    }
  },

  {
    id: 42,
    name: "Alvin Kamara",
    position: "RB",
    team: "New Orleans Saints",
    color: "#D3BC8D",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3054850.png",

    fantasy: {
      ppg: 15.5,
      consistency: 0.61,
      boomRate: 0.22,
      bustRate: 0.17,
    },

    rushing: {
      yards: 780,
      tds: 5,
      yardsAfterContact: 350,
      brokenTackles: 10,
    },

    receiving: {
      receptions: 77,
      recYards: 480,
      recTD: 2,
      targetShare: 0.21,
    },

    advanced: {
      successRate: 0.43,
      snapShare: 0.65,
      epaPerPlay: 0.10,
      yac: 290,
    },

    trends: {
      last5GamesPPG: [14.9, 16.0, 15.2, 13.7, 16.5],
      projectedNextWeek: 15.4,
      hotStreak: true,
    }
  },

  // ==========================
  //         MORE TEs
  // ==========================

  {
    id: 43,
    name: "Dalton Kincaid",
    position: "TE",
    team: "Buffalo Bills",
    color: "#00338D",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4385690.png",

    fantasy: {
      ppg: 12.7,
      consistency: 0.60,
      boomRate: 0.17,
      bustRate: 0.16,
    },

    receiving: {
      receptions: 71,
      recYards: 720,
      recTD: 5,
      airYards: 940,
      targetShare: 0.18,
      yac: 260,
    },

    advanced: {
      contestedCatchRate: 0.41,
      routeWinRate: 0.46,
      epaPerPlay: 0.12,
    },

    trends: {
      last5GamesPPG: [12.4, 15.1, 10.9, 14.4, 12.8],
      projectedNextWeek: 12.9,
      hotStreak: false,
    }
  },

  {
    id: 44,
    name: "Evan Engram",
    position: "TE",
    team: "Jacksonville Jaguars",
    color: "#006778",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3051876.png",

    fantasy: {
      ppg: 12.2,
      consistency: 0.58,
      boomRate: 0.16,
      bustRate: 0.18,
    },

    receiving: {
      receptions: 86,
      recYards: 750,
      recTD: 4,
      airYards: 980,
      targetShare: 0.19,
      yac: 290,
    },

    advanced: {
      contestedCatchRate: 0.38,
      routeWinRate: 0.45,
      epaPerPlay: 0.11,
    },

    trends: {
      last5GamesPPG: [11.4, 13.8, 12.1, 10.9, 14.5],
      projectedNextWeek: 12.2,
      hotStreak: true,
    }
  },

  {
    id: 45,
    name: "Jake Ferguson",
    position: "TE",
    team: "Dallas Cowboys",
    color: "#041E42",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4242355.png",

    fantasy: {
      ppg: 12.5,
      consistency: 0.59,
      boomRate: 0.17,
      bustRate: 0.17,
    },

    receiving: {
      receptions: 74,
      recYards: 820,
      recTD: 5,
      airYards: 1000,
      targetShare: 0.18,
      yac: 300,
    },

    advanced: {
      contestedCatchRate: 0.40,
      routeWinRate: 0.46,
      epaPerPlay: 0.12,
    },

    trends: {
      last5GamesPPG: [12.0, 14.1, 11.3, 13.5, 12.7],
      projectedNextWeek: 12.6,
      hotStreak: false,
    }
  },

  // ==========================
  //     FINAL 5 PLAYERS
  // ==========================

  {
    id: 46,
    name: "Jordan Addison",
    position: "WR",
    team: "Minnesota Vikings",
    color: "#4F2683",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4429205.png",

    fantasy: {
      ppg: 13.8,
      consistency: 0.57,
      boomRate: 0.21,
      bustRate: 0.17,
    },

    receiving: {
      receptions: 70,
      recYards: 910,
      recTD: 8,
      airYards: 1300,
      targetShare: 0.17,
      yac: 270,
    },

    advanced: {
      contestedCatchRate: 0.35,
      routeWinRate: 0.47,
      epaPerPlay: 0.13,
    },

    trends: {
      last5GamesPPG: [12.1, 14.9, 13.4, 16.0, 12.8],
      projectedNextWeek: 13.7,
      hotStreak: true,
    }
  },

  {
    id: 47,
    name: "Calvin Ridley",
    position: "WR",
    team: "Tennessee Titans",
    color: "#0C2340",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4429205.png",

    fantasy: {
      ppg: 13.5,
      consistency: 0.55,
      boomRate: 0.22,
      bustRate: 0.18,
    },

    receiving: {
      receptions: 72,
      recYards: 1040,
      recTD: 6,
      airYards: 1560,
      targetShare: 0.20,
      yac: 260,
    },

    advanced: {
      contestedCatchRate: 0.37,
      routeWinRate: 0.46,
      epaPerPlay: 0.14,
    },

    trends: {
      last5GamesPPG: [13.5, 14.0, 12.1, 15.3, 12.8],
      projectedNextWeek: 13.4,
      hotStreak: false,
    }
  },

  {
    id: 48,
    name: "Kenneth Walker III",
    position: "RB",
    team: "Seattle Seahawks",
    color: "#002244",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4567048.png",

  
    fantasy: {
      ppg: 16.2,
      consistency: 0.61,
      boomRate: 0.23,
      bustRate: 0.14,
    },
  
    rushing: {
      yards: 1060,
      tds: 12,
      yardsAfterContact: 475,
      brokenTackles: 18,
    },
    
    receiving: {
      receptions: 41,
      recYards: 345,
      recTD: 2,
      targetShare: 0.10,
    },
  
    advanced: {
      successRate: 0.47,
      snapShare: 0.65,
      epaPerPlay: 0.13,
      yac: 290,
    },
  
    trends: {
      last5GamesPPG: [15.8, 17.0, 14.2, 16.5, 16.3],
      projectedNextWeek: 16.0,
      hotStreak: true,
    }
  },  

  {
    id: 49,
    name: "Kyle Pitts",
    position: "TE",
    team: "Atlanta Falcons",
    color: "#A71930",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/4360248.png",


    fantasy: {
      ppg: 12.1,
      consistency: 0.54,
      boomRate: 0.19,
      bustRate: 0.21,
    },

    receiving: {
      receptions: 65,
      recYards: 760,
      recTD: 4,
      airYards: 1040,
      targetShare: 0.19,
      yac: 240,
    },

    advanced: {
      contestedCatchRate: 0.33,
      routeWinRate: 0.45,
      epaPerPlay: 0.11,
    },

    trends: {
      last5GamesPPG: [11.0, 14.1, 10.8, 12.5, 12.0],
      projectedNextWeek: 12.1,
      hotStreak: false,
    }
  },

  {
    id: 50,
    name: "Aaron Jones",
    position: "RB",
    team: "Green Bay Packers",
    color: "#203731",
    photo: "https://a.espncdn.com/i/headshots/nfl/players/full/3042519.png",
  
    fantasy: {
      ppg: 14.8,
      consistency: 0.63,
      boomRate: 0.22,
      bustRate: 0.12,
    },
  
    rushing: {
      yards: 1125,
      tds: 7,
    },
  
    receiving: {
      receptions: 44,
      recYards: 391,
      recTD: 2,
    },
  
    advanced: {
      routeWinRate: 0.27,
      epaPerPlay: 0.15,
    },
  
    trends: {
      last5GamesPPG: [13.2, 17.5, 15.1, 12.9, 14.7],
      projectedNextWeek: 15.3,
      hotStreak: false,
    }
  }
  
];


export default players;
      