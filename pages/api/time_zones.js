/*
 * Copyright 2022 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Key entries must be lowercase.
// Note that for non-Japanese locales, the preposition is included.
// TODO: Add support for other locations, and put in separate file, using some
// of these as a guide https://www.worldometers.info/geography/alphabetical-list-of-countries/
const locTimeZoneMap = {

  //United States
  "in the united states": "America/New_York", //en-US
  "in america": "America/New_York", //en-US
  "in the us": "America/New_York", //en-US
  "en estados unidos": "America/New_York", //es-ES
  "aux états-unis": "America/New_York", //fr-FR
  "アメリカ": "America/New_York", //ja-JP
  "米国": "America/New_York", //ja-JP

  //--New York
  "in new york": "America/New_York", //en-US
  "in new york city": "America/New_York", //en-US
  "en nueva york": "America/New_York", //es-ES
  "à new york": "America/New_York", //fr-FR
  "ニューヨーク": "America/New_York", //ja-JP

  //--Los Angeles
  "in los angeles": "America/Los_Angeles", //en-US
  "en los angeles": "America/Los_Angeles", //es-ES
  "à los angeles": "America/Los_Angeles", //fr-FR
  "ロサンゼルス": "America/Los_Angeles", //ja-JP

  //--Chicago
  "in chicago": "America/Chicago", //en-US
  "en chicago": "America/Chicago", //es-ES
  "à chicago": "America/Chicago", //fr-FR
  "シカゴ": "America/Chicago", //ja-JP

  //--Houston
  "in houston": "America/Houston", //en-US
  "en houston": "America/Houston", //es-ES
  "à houston": "America/Houston", //fr-FR
  "ヒューストン": "America/Houston", //ja-JP

  //--Philadelphia
  "in philadelphia": "America/New_York", //en-US
  "en filadelfia": "America/New_York", //es-ES
  "à philadelphia": "America/New_York", //fr-FR
  "フィラデルフィア": "America/New_York", //ja-JP

  //--Dallas
  "in dallas": "America/Chicago", //en-US
  "en dallas": "America/Chicago", //es-ES
  "à dallas": "America/Chicago", //fr-FR
  "ダラス": "America/Chicago", //ja-JP

  //--Miami
  "in miami": "America/New_York", //en-US
  "en miami": "America/New_York", //es-ES
  "à miami": "America/New_York", //fr-FR
  "マイアミ": "America/New_York", //ja-JP

  //--Boston
  "in boston": "America/New_York", //en-US
  "en boston": "America/New_York", //es-ES
  "à boston": "America/New_York", //fr-FR
  "ボストン": "America/New_York", //ja-JP

  //--Washington
  "in washington": "America/New_York", //en-US
  "en washington": "America/New_York", //es-ES
  "à washington": "America/New_York", //fr-FR
  "ワシントン": "America/New_York", //ja-JP

  //--Seattle
  "in seattle": "America/Los_Angeles", //en-US
  "en seattle": "America/Los_Angeles", //es-ES
  "à seattle": "America/Los_Angeles", //fr-FR
  "セーター": "America/Los_Angeles", //ja-JP

  //--Atlanta
  "in atlanta": "America/New_York", //en-US
  "en atlanta": "America/New_York", //es-ES
  "à atlanta": "America/New_York", //fr-FR
  "アットランタ": "America/New_York", //ja-JP

  //--Denver
  "in denver": "America/Denver", //en-US
  "en denver": "America/Denver", //es-ES
  "à denver": "America/Denver", //fr-FR
  "デンバー": "America/Denver", //ja-JP

  //--Phoenix
  "in phoenix": "America/Phoenix", //en-US
  "en fenix": "America/Phoenix", //es-ES
  "à phénix": "America/Phoenix", //fr-FR
  "フェニックス": "America/Phoenix", //ja-JP

  //--Indianapolis
  "in indianapolis": "America/Indiana/Indianapolis", //en-US
  "en indianapolis": "America/Indiana/Indianapolis", //es-ES
  "à indianapolis": "America/Indiana/Indianapolis", //fr-FR
  "インディアナポリス": "America/Indiana/Indianapolis", //ja-JP

  "in indiana": "America/Indiana/Indianapolis", //en-US
  "en indiana": "America/Indiana/Indianapolis", //es-ES, fr-FR
  "インディアナ": "America/Indiana/Indianapolis", //ja-JP

  "in california": "America/Los_Angeles", //en-US
  "en california": "America/Los_Angeles", //es-ES
  "en californie": "America/Los_Angeles", //fr-FR
  "カリフォルニア": "America/Los_Angeles", //ja-JP
  "カルフォニア": "America/Los_Angeles", //ja-JP

  //Argentina
  "in argentina": "America/Argentina/Buenos_Aires", //en-US
  "en argentina": "America/Argentina/Buenos_Aires", //es-ES
  "en argentine": "America/Argentina/Buenos_Aires", //fr-FR
  "アルゼンチン": "America/Argentina/Buenos_Aires", //ja-JP

  //--Buenos Aires
  "in buenos aires": "America/Argentina/Buenos_Aires", //en-US
  "en buenos aires": "America/Argentina/Buenos_Aires", //es-ES
  "à buenos aires": "America/Argentina/Buenos_Aires", //fr-FR
  "ブエノスアイレス": "America/Argentina/Buenos_Aires", //ja-JP

  //Australia
  "in australia": "Australia/Sydney", //en-US
  "en australia": "Australia/Sydney", //es-ES
  "en australie": "Australia/Sydney", //fr-FR
  "オーストラリア": "Australia/Sydney", //ja-JP

  //--Sydney
  "in sydney": "Australia/Sydney", //en-US
  "en sídney": "Australia/Sydney", //es-ES
  "à sydney": "Australia/Sydney", //fr-FR
  "シドニー": "Australia/Sydney", //ja-JP

  //--Melbourne
  "in melbourne": "Australia/Melbourne", //en-US
  "en melbourne": "Australia/Melbourne", //es-ES
  "à melbourne": "Australia/Melbourne", //fr-FR
  "メルボルン": "Australia/Melbourne", //ja-JP

  //--Brisbane
  "in brisbane": "Australia/Brisbane", //en-US
  "en brisbane": "Australia/Brisbane", //es-ES
  "à brisbane": "Australia/Brisbane", //fr-FR
  "ブリスベン": "Australia/Brisbane", //ja-JP

  //--Adelaide
  "in adelaide": "Australia/Adelaide", //en-US
  "en adelaida": "Australia/Adelaide", //es-ES
  "à adélaïde": "Australia/Adelaide", //fr-FR
  "アデレード": "Australia/Adelaide", //ja-JP

  //--Perth
  "in perth": "Australia/Perth", //en-US
  "en perth": "Australia/Perth", //es-ES
  "à perth": "Australia/Perth", //fr-FR
  "パース": "Australia/Perth", //ja-JP

  //--Canberra
  "in canberra": "Australia/Canberra", //en-US
  "en canberra": "Australia/Canberra", //es-ES
  "à canberra": "Australia/Canberra", //fr-FR
  "キャンベラ": "Australia/Canberra", //ja-JP

  //Austria
  "in austria": "Europe/Vienna", //en-US
  "en austria": "Europe/Vienna", //es-ES
  "en autriche": "Europe/Vienna", //fr-FR
  "オーストリア": "Europe/Vienna", //ja-JP

  //Bahamas
  "in the bahamas": "America/Nassau", //en-US
  "en las bahamas": "America/Nassau", //es-ES
  "aux bahamas": "America/Nassau", //fr-FR
  "バハマ": "America/Nassau", //ja-JP

  //Belgium
  "in belgium": "Europe/Brussels", //en-US
  "en bélgica": "Europe/Brussels", //es-ES
  "en belgique": "Europe/Brussels", //fr-FR
  "ベルギー": "Europe/Brussels", //ja-JP

  //Brazil
  "in brazil": "America/Sao_Paulo", //en-US
  "en brasil": "America/Sao_Paulo", //es-ES
  "au brésil": "America/Sao_Paulo", //fr-FR
  "ブラジル": "America/Sao_Paulo", //ja-JP

  //--São Paulo
  "in são paulo": "America/Sao_Paulo", //en-US
  "en são paulo": "America/Sao_Paulo", //es-ES
  "à são paulo": "America/Sao_Paulo", //fr-FR
  "サンパウロ": "America/Sao_Paulo", //ja-JP

  //--Rio de Janeiro
  "in rio de janeiro": "America/Sao_Paulo", //en-US
  "en rio de janeiro": "America/Sao_Paulo", //es-ES
  "à rio de janeiro": "America/Sao_Paulo", //fr-FR
  "リオデジャネイロ": "America/Sao_Paulo", //ja-JP

  //Cambodia
  "in cambodia": "Asia/Phnom_Penh", //en-US
  "en camboya": "Asia/Phnom_Penh", //es-ES
  "en cambodge": "Asia/Phnom_Penh", //fr-FR
  "カンボジア": "Asia/Phnom_Penh", //ja-JP

  //Canada
  "in canada": "America/Toronto", //en-US
  "en canada": "America/Toronto", //es-ES
  "au canada": "America/Toronto", //fr-FR
  "カナダ": "America/Toronto", //ja-JP

  //--Toronto
  "in toronto": "America/Toronto", //en-US
  "en toronto": "America/Toronto", //es-ES
  "à toronto": "America/Toronto", //fr-FR
  "トロント": "America/Toronto", //ja-JP

  //Chile
  "in chile": "America/Santiago", //en-US
  "en chile": "America/Santiago", //es-ES
  "au chili": "America/Santiago", //fr-FR
  "チリ": "America/Santiago", //ja-JP

  //--Santiago
  "in santiago": "America/Santiago", //en-US
  "en santiago": "America/Santiago", //es-ES
  "à santiago": "America/Santiago", //fr-FR
  "サンチェゴール": "America/Santiago", //ja-JP

  //China
  "in china": "Asia/Shanghai", //en-US
  "en china": "Asia/Shanghai", //es-ES
  "en chine": "Asia/Shanghai", //fr-FR
  "中国": "Asia/Shanghai", //ja-JP

  //--Beijing
  "in beijing": "Asia/Shanghai", //en-US
  "en beijing": "Asia/Shanghai", //es-ES
  "à pékin": "Asia/Shanghai", //fr-FR
  "ベイリング": "Asia/Shanghai", //ja-JP

  //--Shanghai
  "in shanghai": "Asia/Shanghai", //en-US
  "en shanghai": "Asia/Shanghai", //es-ES
  "à shanghai": "Asia/Shanghai", //fr-FR
  "シャンハイ": "Asia/Shanghai", //ja-JP

  //Colombia
  "in colombia": "America/Bogota", //en-US
  "en colombia": "America/Bogota", //es-ES
  "en colombie": "America/Bogota", //fr-FR
  "コロンビア": "America/Bogota", //ja-JP

  //--Bogotá
  "in bogotá": "America/Bogota", //en-US
  "en bogotá": "America/Bogota", //es-ES
  "à bogota": "America/Bogota", //fr-FR
  "ボゴタ": "America/Bogota", //ja-JP

  //Costa Rica
  "in costa rica": "America/Costa_Rica", //en-US
  "en costa rica": "America/Costa_Rica", //es-ES
  "au costa rica": "America/Costa_Rica", //fr-FR
  "コスタリカ": "America/Costa_Rica", //ja-JP

  //Cuba
  "in cuba": "America/Havana", //en-US
  "en cuba": "America/Havana", //es-ES
  "à cuba": "America/Havana", //fr-FR
  "キューバ": "America/Havana", //ja-JP

  //Ecuador
  "in ecuador": "America/Guayaquil", //en-US
  "en ecuador": "America/Guayaquil", //es-ES
  "en equateur": "America/Guayaquil", //fr-FR
  "エクアドル": "America/Guayaquil", //ja-JP

  //Egypt
  "in egypt": "Africa/Cairo", //en-US
  "en egipto": "Africa/Cairo", //es-ES
  "en egypte": "Africa/Cairo", //fr-FR
  "エジプト": "Africa/Cairo", //ja-JP

  //--Cairo
  "in cairo": "Africa/Cairo", //en-US
  "en el cairo": "Africa/Cairo", //es-ES
  "au caire": "Africa/Cairo", //fr-FR
  "カイロ": "Africa/Cairo", //ja-JP

  //England
  "in england": "Europe/London", //en-US
  "en inglaterra": "Europe/London", //es-ES
  "en angleterre": "Europe/London", //fr-FR
  "イギリス": "Europe/London", //ja-JP

  //--London
  "in london": "Europe/London", //en-US
  "en londres": "Europe/London", //es-ES
  "à londres": "Europe/London", //fr-FR
  "ロンドン": "Europe/London", //ja-JP

  //Finland
  "in finland": "Europe/Helsinki", //en-US
  "en finlandia": "Europe/Helsinki", //es-ES
  "en finlande": "Europe/Helsinki", //fr-FR
  "フィンランド": "Europe/Helsinki", //ja-JP

  //France
  "in france": "Europe/Paris", //en-US
  "en francia": "Europe/Paris", //es-ES
  "en france": "Europe/Paris", //fr-FR
  "フランス": "Europe/Paris", //ja-JP

  //--Paris
  "in paris": "Europe/Paris", //en-US
  "en paris": "Europe/Paris", //es-ES
  "à paris": "Europe/Paris", //fr-FR
  "パリ": "Europe/Paris", //ja-JP

  //Germany
  "in germany": "Europe/Berlin", //en-US
  "en alemania": "Europe/Berlin", //es-ES
  "en allemagne": "Europe/Berlin", //fr-FR
  "ドイツ": "Europe/Berlin", //ja-JP

  //Greece
  "in greece": "Europe/Athens", //en-US
  "en grecia": "Europe/Athens", //es-ES
  "en grèce": "Europe/Athens", //fr-FR
  "ギリシア": "Europe/Athens", //ja-JP

  //Hong Kong
  "in hong kong": "Asia/Hong_Kong", //en-US
  "en hong kong": "Asia/Hong_Kong", //es-ES
  "à hong kong": "Asia/Hong_Kong", //fr-FR
  "香港": "Asia/Hong_Kong", //ja-JP

  //India
  "in india": "Asia/Kolkata", //en-US
  "en india": "Asia/Kolkata", //es-ES
  "en inde": "Asia/Kolkata", //fr-FR
  "インド": "Asia/Kolkata", //ja-JP

  //--Delhi
  "in delhi": "Asia/Kolkata", //en-US
  "en delhi": "Asia/Kolkata", //es-ES
  "à delhi": "Asia/Kolkata", //fr-FR
  "デリー": "Asia/Kolkata", //ja-JP

  //--Mumbai
  "in mumbai": "Asia/Kolkata", //en-US
  "en mumbai": "Asia/Kolkata", //es-ES
  "à mumbai": "Asia/Kolkata", //fr-FR
  "ムンバイ": "Asia/Kolkata", //ja-JP

  //--Chennai
  "in chennai": "Asia/Kolkata", //en-US
  "en chennai": "Asia/Kolkata", //es-ES
  "à chennai": "Asia/Kolkata", //fr-FR
  "チェンナイ": "Asia/Kolkata", //ja-JP

  //--Kolkata
  "in kolkata": "Asia/Kolkata", //en-US
  "en calcuta": "Asia/Kolkata", //es-ES
  "à calcutta": "Asia/Kolkata", //fr-FR
  "コルカタ": "Asia/Kolkata", //ja-JP

  //--Bangalore
  "in bangalore": "Asia/Kolkata", //en-US
  "en bangalore": "Asia/Kolkata", //es-ES
  "à bangalore": "Asia/Kolkata", //fr-FR
  "バンガロール": "Asia/Kolkata", //ja-JP

  //--Hyderabad
  "in hyderabad": "Asia/Kolkata", //en-US
  "en hyderabad": "Asia/Kolkata", //es-ES
  "à hyderabad": "Asia/Kolkata", //fr-FR
  "ヒヤダラバード": "Asia/Kolkata", //ja-JP

  //--Pune
  "in pune": "Asia/Kolkata", //en-US
  "en puna": "Asia/Kolkata", //es-ES
  "à pune": "Asia/Kolkata", //fr-FR
  "ピュン": "Asia/Kolkata", //ja-JP

  //Indonesia
  "in indonesia": "Asia/Jakarta", //en-US
  "en indonesia": "Asia/Jakarta", //es-ES
  "en indonésie": "Asia/Jakarta", //fr-FR
  "インドネシア": "Asia/Jakarta", //ja-JP

  //--Jakarta
  "in jakarta": "Asia/Jakarta", //en-US
  "en yakarta": "Asia/Jakarta", //es-ES
  "à jakarta": "Asia/Jakarta", //fr-FR
  "ジャカルタ": "Asia/Jakarta", //ja-JP

  //Ireland
  "in ireland": "Europe/Dublin", //en-US
  "en irlanda": "Europe/Dublin", //es-ES
  "en irlande": "Europe/Dublin", //fr-FR
  "アイルランド": "Europe/Dublin", //ja-JP

  //--Dublin
  "in dublin": "Europe/Dublin", //en-US
  "en dublin": "Europe/Dublin", //es-ES
  "à dublin": "Europe/Dublin", //fr-FR
  "ドブリン": "Europe/Dublin", //ja-JP

  //Italy
  "in italy": "Europe/Rome", //en-US
  "en italia": "Europe/Rome", //es-ES
  "en italie": "Europe/Rome", //fr-FR
  "イタリア": "Europe/Rome", //ja-JP

  //--Rome
  "in rome": "Europe/Rome", //en-US
  "en roma": "Europe/Rome", //es-ES
  "à rome": "Europe/Rome", //fr-FR
  "ローマ": "Europe/Rome", //ja-JP

  //Japan
  "in japan": "Asia/Tokyo", //en-US
  "en japón": "Asia/Tokyo", //es-ES
  "au japon": "Asia/Tokyo", //fr-FR
  "日本": "Asia/Tokyo", //ja-JP

  //--Tokyo
  "in tokyo": "Asia/Tokyo", //en-US
  "en tokio": "Asia/Tokyo", //es-ES
  "à tokyo": "Asia/Tokyo", //fr-FR
  "東京": "Asia/Tokyo", //ja-JP

  //--Osaka
  "in osaka": "Asia/Tokyo", //en-US
  "en osaka": "Asia/Tokyo", //es-ES
  "à osaka": "Asia/Tokyo", //fr-FR
  "大阪": "Asia/Tokyo", //ja-JP

  //--Kyoto
  "in kyoto": "Asia/Tokyo", //en-US
  "en kioto": "Asia/Tokyo", //es-ES
  "à kyoto": "Asia/Tokyo", //fr-FR
  "京都": "Asia/Tokyo", //ja-JP

  //--Nagoya
  "in nagoya": "Asia/Tokyo", //en-US
  "en nagoya": "Asia/Tokyo", //es-ES
  "à nagoya": "Asia/Tokyo", //fr-FR
  "名古屋": "Asia/Tokyo", //ja-JP

  //Malaysia
  "in malaysia": "Asia/Kuala_Lumpur", //en-US
  "en malasia": "Asia/Kuala_Lumpur", //es-ES
  "en malaisie": "Asia/Kuala_Lumpur", //fr-FR
  "マレーシア": "Asia/Kuala_Lumpur", //ja-JP

  //--Kuala Lumpur
  "in kuala lumpur": "Asia/Kuala_Lumpur", //en-US
  "en kuala lumpur": "Asia/Kuala_Lumpur", //es-ES
  "à kuala lumpur": "Asia/Kuala_Lumpur", //fr-FR
  "クアラルンプール": "Asia/Kuala_Lumpur", //ja-JP

  //Maldives
  "in maldives": "Indian/Maldives", //en-US
  "en maldivas": "Indian/Maldives", //es-ES
  "aux maldives": "Indian/Maldives", //fr-FR
  "モルディブ": "Indian/Maldives", //ja-JP

  //Mexico
  "in mexico": "America/Mexico_City", //en-US
  "en méxico": "America/Mexico_City", //es-ES
  "au mexique": "America/Mexico_City", //fr-FR
  "メキシコ": "America/Mexico_City", //ja-JP

  //--Mexico City
  "in mexico city": "America/Mexico_City", //en-US
  "en ciudad de mexico": "America/Mexico_City", //es-ES
  "à mexico": "America/Mexico_City", //fr-FR
  "メキシコシティ": "America/Mexico_City", //ja-JP

  //Netherlands
  "in netherlands": "Europe/Amsterdam", //en-US
  "en paises bajos": "Europe/Amsterdam", //es-ES
  "aux pays-bas": "Europe/Amsterdam", //fr-FR, spoken 'au pays-bas' is recognized
  "オランダ": "Europe/Amsterdam", //ja-JP

  //--Amsterdam
  "in amsterdam": "Europe/Amsterdam", //en-US
  "en amsterdam": "Europe/Amsterdam", //es-ES
  "à amsterdam": "Europe/Amsterdam", //fr-FR
  "アムステルダム": "Europe/Amsterdam", //ja-JP

  //New Zealand
  "in new zealand": "Pacific/Auckland", //en-US
  "en nueva zelanda": "Pacific/Auckland", //es-ES
  "en nouvelle-zélande": "Pacific/Auckland", //fr-FR
  "ニュージーランド": "Pacific/Auckland", //ja-JP

  //--Auckland
  "in auckland": "Pacific/Auckland", //en-US
  "en auckland": "Pacific/Auckland", //es-ES
  "à auckland": "Pacific/Auckland", //fr-FR
  "オークランド": "Pacific/Auckland", //ja-JP

  //Norway
  "in norway": "Europe/Oslo", //en-US
  "en noruega": "Europe/Oslo", //es-ES
  "en norvège": "Europe/Oslo", //fr-FR
  "ノルウェー": "Europe/Oslo", //ja-JP

  //--Oslo
  "in oslo": "Europe/Oslo", //en-US
  "en oslo": "Europe/Oslo", //es-ES
  "à oslo": "Europe/Oslo", //fr-FR
  "オスロ": "Europe/Oslo", //ja-JP

  //Pakistan
  "in pakistan": "Asia/Karachi", //en-US
  "en pakistan": "Asia/Karachi", //es-ES
  "au pakistan": "Asia/Karachi", //fr-FR
  "パキスタン": "Asia/Karachi", //ja-JP

  //--Karachi
  "in karachi": "Asia/Karachi", //en-US
  "en karachi": "Asia/Karachi", //es-ES
  "à karachi": "Asia/Karachi", //fr-FR
  "カラチ": "Asia/Karachi", //ja-JP

  //Philippines
  "in the philippines": "Asia/Manila", //en-US
  "en filipinas": "Asia/Manila", //es-ES
  "aux philippines": "Asia/Manila", //fr-FR
  "フィリピン": "Asia/Manila", //ja-JP

  //--Manila
  "in manila": "Asia/Manila", //en-US
  "en manila": "Asia/Manila", //es-ES
  "à manille": "Asia/Manila", //fr-FR
  "マニラ": "Asia/Manila", //ja-JP

  //Poland
  "in poland": "Europe/Warsaw", //en-US
  "en polonia": "Europe/Warsaw", //es-ES
  "en pologne": "Europe/Warsaw", //fr-FR
  "ポーランド": "Europe/Warsaw", //ja-JP

  //--Warsaw
  "in warsaw": "Europe/Warsaw", //en-US
  "en varsovia": "Europe/Warsaw", //es-ES
  "à varsovie": "Europe/Warsaw", //fr-FR
  "ワルシャワ": "Europe/Warsaw", //ja-JP

  //Portugal
  "in portugal": "Europe/Lisbon", //en-US
  "en portugal": "Europe/Lisbon", //es-ES
  "au portugal": "Europe/Lisbon", //fr-FR
  "ポルトガル": "Europe/Lisbon", //ja-JP

  //--Lisbon
  "in lisbon": "Europe/Lisbon", //en-US
  "en lisboa": "Europe/Lisbon", //es-ES
  "à lisbonne": "Europe/Lisbon", //fr-FR
  "リスボン": "Europe/Lisbon", //ja-JP

  //Russia
  "in russia": "Europe/Moscow", //en-US
  "en rusia": "Europe/Moscow", //es-ES
  "en russie": "Europe/Moscow", //fr-FR
  "ロシア": "Europe/Moscow", //ja-JP

  //--Moscow
  "in moscow": "Europe/Moscow", //en-US
  "en moscu": "Europe/Moscow", //es-ES
  "à moscou": "Europe/Moscow", //fr-FR
  "モスクワ": "Europe/Moscow", //ja-JP

  //Singapore
  "in singapore": "Asia/Singapore", //en-US
  "en singapur": "Asia/Singapore", //es-ES
  "à singapour": "Asia/Singapore", //fr-FR
  "シンガポール": "Asia/Singapore", //ja-JP

  //South Africa
  "in south africa": "Africa/Johannesburg", //en-US
  "en sudafrica": "Africa/Johannesburg", //es-ES
  "en afrique du sud": "Africa/Johannesburg", //fr-FR
  "南アフリカ": "Africa/Johannesburg", //ja-JP

  //--Johannesburg
  "in johannesburg": "Africa/Johannesburg", //en-US
  "en johannesburgo": "Africa/Johannesburg", //es-ES
  "à johannesbourg": "Africa/Johannesburg", //fr-FR
  "ジョージボワール": "Africa/Johannesburg", //ja-JP

  //South Korea
  "in south korea": "Asia/Seoul", //en-US
  "en corea del sur": "Asia/Seoul", //es-ES
  "en corée du sud": "Asia/Seoul", //fr-FR
  "韓国": "Asia/Seoul", //ja-JP

  //--Seoul
  "in seoul": "Asia/Seoul", //en-US
  "en seul": "Asia/Seoul", //es-ES
  "à séoul": "Asia/Seoul", //fr-FR
  "ソウル": "Asia/Seoul", //ja-JP

  //Spain
  "in spain": "Europe/Madrid", //en-US
  "en españa": "Europe/Madrid", //es-ES
  "en espagne": "Europe/Madrid", //fr-FR
  "スペイン": "Europe/Madrid", //ja-JP

  //--Madrid
  "in madrid": "Europe/Madrid", //en-US
  "en madrid": "Europe/Madrid", //es-ES
  "à madrid": "Europe/Madrid", //fr-FR
  "マドリド": "Europe/Madrid", //ja-JP

  //--Barcelona
  "in barcelona": "Europe/Madrid", //en-US
  "en barcelona": "Europe/Madrid", //es-ES
  "à barcelone": "Europe/Madrid", //fr-FR
  "バルセロナ": "Europe/Madrid", //ja-JP

  //Sweden
  "in sweden": "Europe/Stockholm", //en-US
  "en suecia": "Europe/Stockholm", //es-ES
  "en suède": "Europe/Stockholm", //fr-FR
  "スウェーデン": "Europe/Stockholm", //ja-JP

  //--Stockholm
  "in stockholm": "Europe/Stockholm", //en-US
  "en estocolmo": "Europe/Stockholm", //es-ES
  "à stockholm": "Europe/Stockholm", //fr-FR
  "ストックホルム": "Europe/Stockholm", //ja-JP

  //Switzerland
  "in switzerland": "Europe/Zurich", //en-US
  "en suiza": "Europe/Zurich", //es-ES
  "en suisse": "Europe/Zurich", //fr-FR
  "スイス": "Europe/Zurich", //ja-JP

  //--Zurich
  "in zurich": "Europe/Zurich", //en-US
  "en zúrich": "Europe/Zurich", //es-ES
  "à zurich": "Europe/Zurich", //fr-FR
  "ヨーゲル": "Europe/Zurich", //ja-JP

  //Taiwan
  "in taiwan": "Asia/Taipei", //en-US
  "en taiwán": "Asia/Taipei", //es-ES
  "à taïwan": "Asia/Taipei", //fr-FR
  "台湾": "Asia/Taipei", //ja-JP

  //--Taipei
  "in taipei": "Asia/Taipei", //en-US
  "en taipei": "Asia/Taipei", //es-ES
  "à taipei": "Asia/Taipei", //fr-FR
  "台北": "Asia/Taipei", //ja-JP

  //Thailand
  "in thailand": "Asia/Bangkok", //en-US
  "en tailandia": "Asia/Bangkok", //es-ES
  "en thaïlande": "Asia/Bangkok", //fr-FR
  "タイ": "Asia/Bangkok", //ja-JP

  //--Bangkok
  "in bangkok": "Asia/Bangkok", //en-US
  "en bangkok": "Asia/Bangkok", //es-ES
  "à bangkok": "Asia/Bangkok", //fr-FR
  "バンコク": "Asia/Bangkok", //ja-JP

  //Turkey
  "in turkey": "Europe/Istanbul", //en-US
  "en turquía": "Europe/Istanbul", //es-ES
  "en turquie": "Europe/Istanbul", //fr-FR
  "トルコ": "Europe/Istanbul", //ja-JP

  //--Istanbul
  "in istanbul": "Europe/Istanbul", //en-US
  "en estambul": "Europe/Istanbul", //es-ES
  "à istanbul": "Europe/Istanbul", //fr-FR
  "イスタンブール": "Europe/Istanbul", //ja-JP

  //United Kingdom
  "in the united kingdom": "Europe/London", //en-US
  "en el reino unido": "Europe/London", //es-ES
  "au royaume-uni": "Europe/London", //fr-FR
  //"イギリス": "Europe/London" (see England), //ja-JP

  //
}

export function getTimeZoneStr(locStr, locale) {
  let timeZoneStr = locTimeZoneMap[locStr.toLowerCase()];
  return timeZoneStr;
}