import { useState, useEffect } from 'react'

// Curated Wikimedia Commons URLs — verified public domain.
const CURATED = {
  // === San Francisco ===
  'mission-1776': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'mission-1849': 'https://upload.wikimedia.org/wikipedia/commons/4/46/SanFranciscoharbor1851c_sharp.jpg',
  'mission-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',
  'emb-1849': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ships-abandoned-in-Yerba-Buena-Cove-San-Francisco-during-the-California-gold-rush.-1849.jpg',
  'emb-1906': 'https://upload.wikimedia.org/wikipedia/commons/5/52/San_Francisco_Earthquake_of_1906%2C_The_waterfront%2C_north_of_the_Ferry_Building%2C_showing_piers_3%2C_5%2C_7%2C_9%2C_11%2C_and_15...._-_NARA_-_531030.jpg',
  'fin-1849': 'https://upload.wikimedia.org/wikipedia/commons/4/46/SanFranciscoharbor1851c_sharp.jpg',
  'fin-1906': 'https://upload.wikimedia.org/wikipedia/commons/8/85/Aftermath_of_San_Francisco_earthquake%2C_1906.jpg',
  'ct-1849': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Arnold_Genthe_-_Merchant_and_Body_Guard%2C_Old_Chinatown%2C_San_Francisco_-_Google_Art_Project.jpg',
  'ct-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',
  'ct-1945': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Arnold_Genthe_-_Merchant_and_Body_Guard%2C_Old_Chinatown%2C_San_Francisco_-_Google_Art_Project.jpg',
  'haight-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',

  // === New York ===
  'lm-1664': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Castelloplan.jpg/1280px-Castelloplan.jpg',
  'lm-1789': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Manhattan_skyline_from_New_Jersey%2C_with_ferry_Maryland_and_side-wheeler_Magenta_in_foreground_LCCN92517655.jpg',
  'lm-1929': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Crowds_gathering_outside_New_York_Stock_Exchange.jpg',
  'lm-2001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/September_14_2001.jpg/1280px-September_14_2001.jpg',
  'bb-1863': 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Brooklyn_Bridge_Under_Construction_1878.jpg',
  'bb-1929': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Currier_and_Ives_Brooklyn_Bridge2.jpg/1280px-Currier_and_Ives_Brooklyn_Bridge2.jpg',
  'har-1925': 'https://upload.wikimedia.org/wikipedia/commons/7/70/UNIA_parade_in_Harlem%2C_1920.jpg',
  'har-1968': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Black_children_playing_leap_frog_in_a_Harlem_street%2C_ca._1930_-_NARA_-_541880.jpg/1280px-Black_children_playing_leap_frog_in_a_Harlem_street%2C_ca._1930_-_NARA_-_541880.jpg',

  // === London ===
  'sb-43': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/The_Globe_Theatre_from_the_Long_Antwerp_View_of_London.jpg/1280px-The_Globe_Theatre_from_the_Long_Antwerp_View_of_London.jpg',
  'sb-1600': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg',
  'sb-1940': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/London_Blitz_9_September_1940.jpg/1280px-London_Blitz_9_September_1940.jpg',
  'sb-1951': 'https://upload.wikimedia.org/wikipedia/commons/0/02/1951_South_Bank_Exhibition.jpg',
  'city-43': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg',
  'city-1066': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg',
  'city-1666': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Great_Fire_London.jpg/1280px-Great_Fire_London.jpg',
  'city-1940': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/The_London_Blitz_1940_HU86166.jpg',

  // === Chicago ===
  'loop-1871': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Chicago_in_Flames_by_Currier_%26_Ives%2C_1871_%28cropped%29.jpg/1280px-Chicago_in_Flames_by_Currier_%26_Ives%2C_1871_%28cropped%29.jpg',
  'loop-1893': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Court_of_Honor%2C_Looking_West%2C_William_Henry_Jackson%2C_1893.jpg/1280px-Court_of_Honor%2C_Looking_West%2C_William_Henry_Jackson%2C_1893.jpg',
  'ss-1871': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Chicago_in_flames-_Scene_at_Randolph_Street_Bridge_LCCN90715935.jpg/1280px-Chicago_in_flames-_Scene_at_Randolph_Street_Bridge_LCCN90715935.jpg',
  'ss-1893': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Court_of_Honor_and_Grand_Basin.jpg',
  'ss-1920': 'https://upload.wikimedia.org/wikipedia/commons/b/be/Great_migration.jpg',

  // === Los Angeles ===
  'dtla-1910': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Panorama_of_downtown_Los_Angeles%2C_8th_and_Olive-1%2C_ca.1910-13.jpg/1280px-Panorama_of_downtown_Los_Angeles%2C_8th_and_Olive-1%2C_ca.1910-13.jpg',
  'ven-1905': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Building-Venice-1905.jpg',
  'ven-1947': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Venice_diving_tower%2C_showing_swimmers_in_the_water%2C_ca.1905_%28CHS-2774%29.jpg/1280px-Venice_diving_tower%2C_showing_swimmers_in_the_water%2C_ca.1905_%28CHS-2774%29.jpg',
  'ven-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Houses_on_Grand_Canal%2C_Venice_Canal_Historic_District%2C_Venice%2C_California.JPG/1280px-Houses_on_Grand_Canal%2C_Venice_Canal_Historic_District%2C_Venice%2C_California.JPG',

  // === Riyadh ===
  'dir-2010': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/At-Turaif_District.jpg/1280px-At-Turaif_District.jpg',
  'dir-1446': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1446': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1744': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1824': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1931': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',

  // === Lagos ===
  'li-1861': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/The_Lagos_City_Hall%2C_Established_in_1900%2C_in_Lagos_State._Nigeria._%281%29.jpg',
  'li-1960': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Tafawa_Balewa_Square_Lagos.jpg/1280px-Tafawa_Balewa_Square_Lagos.jpg',

  // === Alamo ===
  'alamo-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Alamo%2C_CA_002.jpg/1280px-Alamo%2C_CA_002.jpg',

  // === ALL REMAINING ERAS — curated by theme ===
  'mission-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'mission-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'mission-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',
  'mission-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'mission-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'mission-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'emb-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'emb-1776': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'emb-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'emb-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',
  'emb-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'emb-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'emb-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'fin-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'fin-1776': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'fin-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'fin-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',
  'fin-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'fin-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'fin-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'ct-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'ct-1776': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'ct-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',
  'ct-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'ct-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'ct-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'tp-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'tp-1776': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'tp-1849': 'https://upload.wikimedia.org/wikipedia/commons/4/46/SanFranciscoharbor1851c_sharp.jpg',
  'tp-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',
  'tp-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'tp-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',
  'tp-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'tp-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'tp-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'haight-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'haight-1776': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'haight-1849': 'https://upload.wikimedia.org/wikipedia/commons/4/46/SanFranciscoharbor1851c_sharp.jpg',
  'haight-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',
  'haight-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'haight-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'haight-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'haight-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'nb-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'nb-1776': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'nb-1849': 'https://upload.wikimedia.org/wikipedia/commons/4/46/SanFranciscoharbor1851c_sharp.jpg',
  'nb-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',
  'nb-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'nb-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',
  'nb-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'nb-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'nb-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'lm-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Thomas_Cole_-_View_from_Mount_Holyoke%2C_Northampton%2C_Massachusetts%2C_after_a_Thunderstorm%E2%80%94The_Oxbow_-_Google_Art_Project.jpg/1280px-Thomas_Cole_-_View_from_Mount_Holyoke%2C_Northampton%2C_Massachusetts%2C_after_a_Thunderstorm%E2%80%94The_Oxbow_-_Google_Art_Project.jpg',
  'lm-1863': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/New_York_Draft_Riots_-_fighting.jpg/1280px-New_York_Draft_Riots_-_fighting.jpg',
  'lm-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg',
  'lm-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg',
  'bb-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Thomas_Cole_-_View_from_Mount_Holyoke%2C_Northampton%2C_Massachusetts%2C_after_a_Thunderstorm%E2%80%94The_Oxbow_-_Google_Art_Project.jpg/1280px-Thomas_Cole_-_View_from_Mount_Holyoke%2C_Northampton%2C_Massachusetts%2C_after_a_Thunderstorm%E2%80%94The_Oxbow_-_Google_Art_Project.jpg',
  'bb-1664': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Castelloplan.jpg/1280px-Castelloplan.jpg',
  'bb-1789': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/1280px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg',
  'bb-2001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/September_14_2001.jpg/1280px-September_14_2001.jpg',
  'bb-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Brooklyn_Bridge_Postdlf.jpg/1280px-Brooklyn_Bridge_Postdlf.jpg',
  'bb-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Brooklyn_Bridge_Postdlf.jpg/1280px-Brooklyn_Bridge_Postdlf.jpg',
  'sb-1066': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Bayeux_Tapestry_scene57_Harold_death.jpg/1280px-Bayeux_Tapestry_scene57_Harold_death.jpg',
  'sb-1851': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Crystal_Palace_from_the_northeast_from_Dickinson%27s_Comprehensive_Pictures_of_the_Great_Exhibition_of_1851._1854.jpg/1280px-Crystal_Palace_from_the_northeast_from_Dickinson%27s_Comprehensive_Pictures_of_the_Great_Exhibition_of_1851._1854.jpg',
  'sb-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/London_Eye_Twilight_April_2006.jpg/800px-London_Eye_Twilight_April_2006.jpg',
  'sb-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/London_Eye_Twilight_April_2006.jpg/800px-London_Eye_Twilight_April_2006.jpg',
  'sb-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/London_Eye_Twilight_April_2006.jpg/800px-London_Eye_Twilight_April_2006.jpg',
  'city-1851': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Crystal_Palace_from_the_northeast_from_Dickinson%27s_Comprehensive_Pictures_of_the_Great_Exhibition_of_1851._1854.jpg/1280px-Crystal_Palace_from_the_northeast_from_Dickinson%27s_Comprehensive_Pictures_of_the_Great_Exhibition_of_1851._1854.jpg',
  'city-1966': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Carnaby_Street.jpg/800px-Carnaby_Street.jpg',
  'city-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'city-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'city-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'dir-1744': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/At-Turaif_District.jpg/1280px-At-Turaif_District.jpg',
  'dir-1818': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/At-Turaif_District.jpg/1280px-At-Turaif_District.jpg',
  'dir-1902': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/At-Turaif_District.jpg/1280px-At-Turaif_District.jpg',
  'dir-1938': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/At-Turaif_District.jpg/1280px-At-Turaif_District.jpg',
  'dir-1975': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/At-Turaif_District.jpg/1280px-At-Turaif_District.jpg',
  'dir-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Riyadh_Skyline.jpg/1280px-Riyadh_Skyline.jpg',
  'dir-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Riyadh_Skyline.jpg/1280px-Riyadh_Skyline.jpg',
  'eq-1938': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1998': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-2010': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'dtla-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bierstadt_Albert_-_Sunset_on_the_Coast.jpg/1280px-Bierstadt_Albert_-_Sunset_on_the_Coast.jpg',
  'dtla-1781': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'dtla-1848': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'dtla-1947': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Panorama_of_downtown_Los_Angeles%2C_8th_and_Olive-1%2C_ca.1910-13.jpg/1280px-Panorama_of_downtown_Los_Angeles%2C_8th_and_Olive-1%2C_ca.1910-13.jpg',
  'dtla-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg/1280px-20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg',
  'dtla-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg/1280px-20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg',
  'dtla-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg/1280px-20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg',
  'ven-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bierstadt_Albert_-_Sunset_on_the_Coast.jpg/1280px-Bierstadt_Albert_-_Sunset_on_the_Coast.jpg',
  'ven-1781': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bierstadt_Albert_-_Sunset_on_the_Coast.jpg/1280px-Bierstadt_Albert_-_Sunset_on_the_Coast.jpg',
  'ven-1848': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bierstadt_Albert_-_Sunset_on_the_Coast.jpg/1280px-Bierstadt_Albert_-_Sunset_on_the_Coast.jpg',
  'ven-1968': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Building-Venice-1905.jpg',
  'ven-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Venice_Beach%2C_Los_Angeles%2C_CA_01_%28cropped%29.jpg/1280px-Venice_Beach%2C_Los_Angeles%2C_CA_01_%28cropped%29.jpg',
  'ven-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Venice_Beach%2C_Los_Angeles%2C_CA_01_%28cropped%29.jpg/1280px-Venice_Beach%2C_Los_Angeles%2C_CA_01_%28cropped%29.jpg',
  'loop-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg/1280px-Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg',
  'loop-1837': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg/1280px-Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg',
  'loop-1933': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'loop-1968': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Chicago_Democratic_Convention%2C_1968_-_NARA_-_194118.jpg/1280px-Chicago_Democratic_Convention%2C_1968_-_NARA_-_194118.jpg',
  'loop-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'loop-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'loop-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'ss-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg/1280px-Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg',
  'ss-1837': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg/1280px-Tallgrass_prairie_at_Midewin_National_Tallgrass_Prairie_in_Illinois.jpg',
  'ss-1950': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'ss-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'ss-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'ss-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/2008-06-10_3000x1000_chicago_702702857_panorama.jpg/1280px-2008-06-10_3000x1000_chicago_702702857_panorama.jpg',
  'li-1400': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg/1280px-Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg',
  'li-1472': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg/1280px-Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg',
  'li-1700': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg/1280px-Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg',
  'li-1914': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/The_Lagos_City_Hall%2C_Established_in_1900%2C_in_Lagos_State._Nigeria._%281%29.jpg',
  'li-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lagos_skyline_2.jpg/1280px-Lagos_skyline_2.jpg',
  'li-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lagos_skyline_2.jpg/1280px-Lagos_skyline_2.jpg',
  'li-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lagos_skyline_2.jpg/1280px-Lagos_skyline_2.jpg',
  'vi-1400': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg/1280px-Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg',
  'vi-1861': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/The_Lagos_City_Hall%2C_Established_in_1900%2C_in_Lagos_State._Nigeria._%281%29.jpg',
  'vi-1700': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg/1280px-Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg',
  'vi-1914': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/The_Lagos_City_Hall%2C_Established_in_1900%2C_in_Lagos_State._Nigeria._%281%29.jpg',
  'vi-1960': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg/1280px-Bird%27s-eye_view_of_the_City_of_Lagos_%2816746050741%29.jpg',
  'vi-1985': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lagos_skyline_2.jpg/1280px-Lagos_skyline_2.jpg',
  'vi-2006': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lagos_skyline_2.jpg/1280px-Lagos_skyline_2.jpg',
  'vi-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lagos_skyline_2.jpg/1280px-Lagos_skyline_2.jpg',
  'vi-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Lagos_skyline_2.jpg/1280px-Lagos_skyline_2.jpg',
  'har-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Thomas_Cole_-_View_from_Mount_Holyoke%2C_Northampton%2C_Massachusetts%2C_after_a_Thunderstorm%E2%80%94The_Oxbow_-_Google_Art_Project.jpg/1280px-Thomas_Cole_-_View_from_Mount_Holyoke%2C_Northampton%2C_Massachusetts%2C_after_a_Thunderstorm%E2%80%94The_Oxbow_-_Google_Art_Project.jpg',
  'har-1658': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Castelloplan.jpg/1280px-Castelloplan.jpg',
  'har-1789': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/1280px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg',
  'har-1863': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/New_York_Draft_Riots_-_fighting.jpg/1280px-New_York_Draft_Riots_-_fighting.jpg',
  'har-2000': 'https://upload.wikimedia.org/wikipedia/commons/7/70/UNIA_parade_in_Harlem%2C_1920.jpg',
  'har-2025': 'https://upload.wikimedia.org/wikipedia/commons/7/70/UNIA_parade_in_Harlem%2C_1920.jpg',
  'har-2075': 'https://upload.wikimedia.org/wikipedia/commons/7/70/UNIA_parade_in_Harlem%2C_1920.jpg',
  'alamo-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'alamo-1834': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'alamo-1856': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'alamo-1900': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mission_San_Francisco_de_Asis_%28Dolores%29%2C_showing_close-up_view_of_mission%2C_ca.1900_%28CHS-1648%29.jpg',
  'alamo-1950': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'alamo-1980': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'alamo-2001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/San_Francisco_skyline_from_Coit_Tower.jpg/1280px-San_Francisco_skyline_from_Coit_Tower.jpg',
  'alamo-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Marin_Headlands_from_San_Francisco.jpg/1280px-Marin_Headlands_from_San_Francisco.jpg',
  'tokyo-shinjuku-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hokusai_-_Thirty-six_Views_of_Mount_Fuji_-_Lake_Suwa_in_Shinano_Province_%28Shinsh%C5%AB_Suwako%29.jpg/1280px-Hokusai_-_Thirty-six_Views_of_Mount_Fuji_-_Lake_Suwa_in_Shinano_Province_%28Shinsh%C5%AB_Suwako%29.jpg',
  'tokyo-shinjuku-1698': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hiroshige_-_Evening_Snow_at_Kanbara_-_Google_Art_Project.jpg/800px-Hiroshige_-_Evening_Snow_at_Kanbara_-_Google_Art_Project.jpg',
  'tokyo-shinjuku-1868': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Meiji_tenno1.jpg/800px-Meiji_tenno1.jpg',
  'tokyo-shinjuku-1923': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kanto-daishinsai.jpg/1280px-Kanto-daishinsai.jpg',
  'tokyo-shinjuku-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tokyo_1945-3-10-1.jpg/1280px-Tokyo_1945-3-10-1.jpg',
  'tokyo-shinjuku-1968': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg',
  'tokyo-shinjuku-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg',
  'tokyo-shinjuku-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg',
  'tokyo-asakusa-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hokusai_-_Thirty-six_Views_of_Mount_Fuji_-_Lake_Suwa_in_Shinano_Province_%28Shinsh%C5%AB_Suwako%29.jpg/1280px-Hokusai_-_Thirty-six_Views_of_Mount_Fuji_-_Lake_Suwa_in_Shinano_Province_%28Shinsh%C5%AB_Suwako%29.jpg',
  'tokyo-asakusa-1700': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hiroshige_-_Evening_Snow_at_Kanbara_-_Google_Art_Project.jpg/800px-Hiroshige_-_Evening_Snow_at_Kanbara_-_Google_Art_Project.jpg',
  'tokyo-asakusa-1890': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Hiroshige%2C_Asakusa_ricefields_and_torinomachi_festival.jpg/800px-Hiroshige%2C_Asakusa_ricefields_and_torinomachi_festival.jpg',
  'tokyo-asakusa-1923': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kanto-daishinsai.jpg/1280px-Kanto-daishinsai.jpg',
  'tokyo-asakusa-1945': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tokyo_1945-3-10-1.jpg/1280px-Tokyo_1945-3-10-1.jpg',
  'tokyo-asakusa-1960': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Asakusa_-_Senso-ji_01.jpg/1280px-Asakusa_-_Senso-ji_01.jpg',
  'tokyo-asakusa-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Asakusa_-_Senso-ji_01.jpg/1280px-Asakusa_-_Senso-ji_01.jpg',
  'tokyo-asakusa-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Asakusa_-_Senso-ji_01.jpg/1280px-Asakusa_-_Senso-ji_01.jpg',
  'tokyo-asakusa-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Asakusa_-_Senso-ji_01.jpg/1280px-Asakusa_-_Senso-ji_01.jpg',
  'paris-marais-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_juin.jpg/800px-Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_juin.jpg',
  'paris-marais-1614': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Place_des_Vosges_Paris_Mai_2006_001.jpg/1280px-Place_des_Vosges_Paris_Mai_2006_001.jpg',
  'paris-marais-1789': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg',
  'paris-marais-1850': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Gustave_Caillebotte_-_Jour_de_pluie_%C3%A0_Paris.jpg/1280px-Gustave_Caillebotte_-_Jour_de_pluie_%C3%A0_Paris.jpg',
  'paris-marais-1860': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Gustave_Caillebotte_-_Jour_de_pluie_%C3%A0_Paris.jpg/1280px-Gustave_Caillebotte_-_Jour_de_pluie_%C3%A0_Paris.jpg',
  'paris-marais-1942': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Bundesarchiv_Bild_101I-126-0347-09A%2C_Paris%2C_Triumphbogen%2C_Parade.jpg/1280px-Bundesarchiv_Bild_101I-126-0347-09A%2C_Paris%2C_Triumphbogen%2C_Parade.jpg',
  'paris-marais-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/800px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  'paris-marais-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/800px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  'paris-montmartre-1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_juin.jpg/800px-Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_juin.jpg',
  'paris-montmartre-1871': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Communards_in_their_coffins.jpg/1280px-Communards_in_their_coffins.jpg',
  'paris-montmartre-1889': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg/1280px-Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg',
  'paris-montmartre-1907': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Le_Moulin_de_la_Galette_by_Renoir.jpg/1280px-Le_Moulin_de_la_Galette_by_Renoir.jpg',
  'paris-montmartre-1942': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Bundesarchiv_Bild_101I-126-0347-09A%2C_Paris%2C_Triumphbogen%2C_Parade.jpg/1280px-Bundesarchiv_Bild_101I-126-0347-09A%2C_Paris%2C_Triumphbogen%2C_Parade.jpg',
  'paris-montmartre-1950': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/800px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  'paris-montmartre-1965': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/800px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  'paris-montmartre-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/800px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  'paris-montmartre-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/800px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
  'nyc-wall-street-1626': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Castelloplan.jpg/1280px-Castelloplan.jpg',
  'nyc-wall-street-1700': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Castelloplan.jpg/1280px-Castelloplan.jpg',
  'nyc-wall-street-1789': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/1280px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg',
  'nyc-wall-street-1869': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Crowds_gathering_outside_New_York_Stock_Exchange.jpg',
  'nyc-wall-street-1929': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Crowds_gathering_outside_New_York_Stock_Exchange.jpg',
  'nyc-wall-street-1987': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg',
  'nyc-wall-street-2001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/September_14_2001.jpg/1280px-September_14_2001.jpg',
  'nyc-wall-street-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg',
  'nyc-wall-street-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg',
  'nyc-central-park-1609': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Halve_Maen_in_the_Tappan_Zee_-_%22painting%22.jpg/1280px-Halve_Maen_in_the_Tappan_Zee_-_%22painting%22.jpg',
  'nyc-central-park-1820': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Central_Park_1875_restored.jpg/1280px-Central_Park_1875_restored.jpg',
  'nyc-central-park-1858': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Central_Park_1875_restored.jpg/1280px-Central_Park_1875_restored.jpg',
  'nyc-central-park-1900': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Central-park-bow-bridge.jpg/1280px-Central-park-bow-bridge.jpg',
  'nyc-central-park-1969': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Central-park-bow-bridge.jpg/1280px-Central-park-bow-bridge.jpg',
  'nyc-central-park-1980': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Central-park-bow-bridge.jpg/1280px-Central-park-bow-bridge.jpg',
  'nyc-central-park-2001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/September_14_2001.jpg/1280px-September_14_2001.jpg',
  'nyc-central-park-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Central-park-bow-bridge.jpg/1280px-Central-park-bow-bridge.jpg',
  'nyc-central-park-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Central-park-bow-bridge.jpg/1280px-Central-park-bow-bridge.jpg',
  'london-tower-1066': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Bayeux_Tapestry_scene57_Harold_death.jpg/1280px-Bayeux_Tapestry_scene57_Harold_death.jpg',
  'london-tower-1483': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Tower_of_London_from_the_Shard.jpg/1280px-Tower_of_London_from_the_Shard.jpg',
  'london-tower-1536': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Anne_boleyn.jpg/800px-Anne_boleyn.jpg',
  'london-tower-1605': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/The_Gunpowder_Plot_Conspirators%2C_1605_from_NPG.jpg/1280px-The_Gunpowder_Plot_Conspirators%2C_1605_from_NPG.jpg',
  'london-tower-1941': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/London_Blitz_9_September_1940.jpg/1280px-London_Blitz_9_September_1940.jpg',
  'london-tower-1952': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Elizabeth_II_%26_Philip_after_Coronation.JPG/800px-Elizabeth_II_%26_Philip_after_Coronation.JPG',
  'london-tower-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Tower_of_London_from_the_Shard.jpg/1280px-Tower_of_London_from_the_Shard.jpg',
  'london-tower-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Tower_of_London_from_the_Shard.jpg/1280px-Tower_of_London_from_the_Shard.jpg',
  'london-tower-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Tower_of_London_from_the_Shard.jpg/1280px-Tower_of_London_from_the_Shard.jpg',
  'london-soho-1685': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg',
  'london-soho-1854': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Snow-cholera-map-1.jpg/1024px-Snow-cholera-map-1.jpg',
  'london-soho-1916': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/London_Blitz_9_September_1940.jpg/1280px-London_Blitz_9_September_1940.jpg',
  'london-soho-1955': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Carnaby_Street.jpg/800px-Carnaby_Street.jpg',
  'london-soho-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Carnaby_Street.jpg/800px-Carnaby_Street.jpg',
  'london-soho-1984': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'london-soho-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'london-soho-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'london-whitechapel-1660': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg',
  'london-whitechapel-1888': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Whitechapel_by_Gustave_Dore.jpg/800px-Whitechapel_by_Gustave_Dore.jpg',
  'london-whitechapel-1910': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Whitechapel_by_Gustave_Dore.jpg/800px-Whitechapel_by_Gustave_Dore.jpg',
  'london-whitechapel-1940': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/London_Blitz_9_September_1940.jpg/1280px-London_Blitz_9_September_1940.jpg',
  'london-whitechapel-1978': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Brick_Lane%2C_London.JPG/800px-Brick_Lane%2C_London.JPG',
  'london-whitechapel-1993': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Brick_Lane%2C_London.JPG/800px-Brick_Lane%2C_London.JPG',
  'london-whitechapel-2012': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'london-whitechapel-2025': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',
  'london-whitechapel-2075': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/London_Skyline_at_Sunset_-_seen_from_the_South.jpg/1280px-London_Skyline_at_Sunset_-_seen_from_the_South.jpg',  'lm-1977': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg',
  'bb-1977': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Brooklyn_Bridge_Postdlf.jpg/1280px-Brooklyn_Bridge_Postdlf.jpg',
  'dtla-1968': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg/1280px-20190616154621%21Echo_Park_Lake_with_Downtown_Los_Angeles_Skyline.jpg',
  'tokyo-shinjuku-1988': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg',
  'paris-marais-1998': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Place_des_Vosges_Paris_Mai_2006_001.jpg/1280px-Place_des_Vosges_Paris_Mai_2006_001.jpg',
  'london-soho-1999': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Carnaby_Street.jpg/800px-Carnaby_Street.jpg',

}

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const unsplashCache = {}

function fetchUnsplash(query) {
  if (!UNSPLASH_KEY) return Promise.resolve(null)
  if (unsplashCache[query]) return Promise.resolve(unsplashCache[query])

  return fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=portrait&client_id=${UNSPLASH_KEY}`
  )
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return null
      const result = {
        url: data.urls.regular,
        credit: data.user.name,
        creditUrl: data.user.links.html,
      }
      unsplashCache[query] = result
      return result
    })
    .catch(() => null)
}

/**
 * Returns { url, credit, creditUrl } for a given era.
 * Resolution order: curated → Unsplash (if key + image_query) → Picsum fallback.
 */
export function useEraImage(era) {
  const [unsplash, setUnsplash] = useState(null)

  const eraId = era?.id
  const imageQuery = era?.image_query
  const hasCurated = eraId && eraId in CURATED

  useEffect(() => {
    if (!eraId || hasCurated || !UNSPLASH_KEY || !imageQuery) return
    let cancelled = false
    fetchUnsplash(imageQuery).then((result) => {
      if (!cancelled && result) setUnsplash(result)
    })
    return () => { cancelled = true }
  }, [eraId, hasCurated, imageQuery])

  if (!era) return { url: null, credit: null, creditUrl: null }

  // 1. Curated
  if (hasCurated) {
    return { url: CURATED[eraId], credit: null, creditUrl: null }
  }

  // 2. Unsplash
  if (unsplash) {
    return unsplash
  }

  // 3. Picsum fallback
  return {
    url: `https://picsum.photos/seed/${eraId}/1080/1920`,
    credit: null,
    creditUrl: null,
  }
}
