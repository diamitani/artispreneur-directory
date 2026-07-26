#!/usr/bin/env python3
"""
Generate 78,000 realistic music industry contacts across 12 categories.
Outputs: contacts.json (all records) + contacts_by_type/ (per-type files)
"""
import json, random, uuid, os, string
from itertools import product

random.seed(42)
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Geo data ──────────────────────────────────────────────────────────────────
US_CITIES = [
    ("New York","NY","US"),("Los Angeles","CA","US"),("Chicago","IL","US"),
    ("Houston","TX","US"),("Phoenix","AZ","US"),("Philadelphia","PA","US"),
    ("San Antonio","TX","US"),("San Diego","CA","US"),("Dallas","TX","US"),
    ("San Jose","CA","US"),("Austin","TX","US"),("Jacksonville","FL","US"),
    ("Fort Worth","TX","US"),("Columbus","OH","US"),("Charlotte","NC","US"),
    ("Indianapolis","IN","US"),("San Francisco","CA","US"),("Seattle","WA","US"),
    ("Denver","CO","US"),("Nashville","TN","US"),("Oklahoma City","OK","US"),
    ("El Paso","TX","US"),("Washington","DC","US"),("Boston","MA","US"),
    ("Las Vegas","NV","US"),("Memphis","TN","US"),("Portland","OR","US"),
    ("Louisville","KY","US"),("Baltimore","MD","US"),("Milwaukee","WI","US"),
    ("Albuquerque","NM","US"),("Tucson","AZ","US"),("Fresno","CA","US"),
    ("Sacramento","CA","US"),("Mesa","AZ","US"),("Kansas City","MO","US"),
    ("Atlanta","GA","US"),("Omaha","NE","US"),("Colorado Springs","CO","US"),
    ("Raleigh","NC","US"),("Long Beach","CA","US"),("Virginia Beach","VA","US"),
    ("Minneapolis","MN","US"),("Tampa","FL","US"),("New Orleans","LA","US"),
    ("Arlington","TX","US"),("Wichita","KS","US"),("Bakersfield","CA","US"),
    ("Aurora","CO","US"),("Anaheim","CA","US"),("Santa Ana","CA","US"),
    ("Corpus Christi","TX","US"),("Riverside","CA","US"),("Lexington","KY","US"),
    ("Stockton","CA","US"),("Pittsburgh","PA","US"),("St. Paul","MN","US"),
    ("Anchorage","AK","US"),("Cincinnati","OH","US"),("Greensboro","NC","US"),
    ("Henderson","NV","US"),("Newark","NJ","US"),("Plano","TX","US"),
    ("Toledo","OH","US"),("Orlando","FL","US"),("St. Louis","MO","US"),
    ("Madison","WI","US"),("Laredo","TX","US"),("Durham","NC","US"),
    ("Lubbock","TX","US"),("Winston-Salem","NC","US"),("Garland","TX","US"),
    ("Glendale","AZ","US"),("Hialeah","FL","US"),("Reno","NV","US"),
    ("Baton Rouge","LA","US"),("Irvine","CA","US"),("Chesapeake","VA","US"),
    ("Irving","TX","US"),("Scottsdale","AZ","US"),("North Las Vegas","NV","US"),
    ("Fremont","CA","US"),("Gilbert","AZ","US"),("San Bernardino","CA","US"),
    ("Birmingham","AL","US"),("Boise","ID","US"),("Rochester","NY","US"),
    ("Richmond","VA","US"),("Spokane","WA","US"),("Des Moines","IA","US"),
    ("Montgomery","AL","US"),("Modesto","CA","US"),("Fayetteville","NC","US"),
    ("Tacoma","WA","US"),("Shreveport","LA","US"),("Akron","OH","US"),
    ("Augusta","GA","US"),("Mobile","AL","US"),("Oxnard","CA","US"),
    ("Providence","RI","US"),("Knoxville","TN","US"),("Chattanooga","TN","US"),
    ("Fort Lauderdale","FL","US"),("Glendale","CA","US"),("Tempe","AZ","US"),
    ("Salt Lake City","UT","US"),("Huntsville","AL","US"),("Little Rock","AR","US"),
    ("Grand Rapids","MI","US"),("Columbus","GA","US"),("Tallahassee","FL","US"),
    ("Worcester","MA","US"),("Aurora","IL","US"),("Overland Park","KS","US"),
    ("Garden Grove","CA","US"),("Oceanside","CA","US"),("Rancho Cucamonga","CA","US"),
    ("Peoria","AZ","US"),("Peoria","IL","US"),("Santa Clarita","CA","US"),
    ("Eugene","OR","US"),("Cape Coral","FL","US"),("Pembroke Pines","FL","US"),
    ("Salem","OR","US"),("Fort Collins","CO","US"),("Lancaster","CA","US"),
    ("Corona","CA","US"),("Elk Grove","CA","US"),("Palmdale","CA","US"),
    ("Salinas","CA","US"),("Sunnyvale","CA","US"),("Pomona","CA","US"),
    ("Surprise","AZ","US"),("Pasadena","TX","US"),("Rockford","IL","US"),
    ("Kansas City","KS","US"),("Torrance","CA","US"),("Escondido","CA","US"),
    ("Hollywood","FL","US"),("Savannah","GA","US"),("Clarksville","TN","US"),
    ("Syracuse","NY","US"),("Bridgeport","CT","US"),("Naperville","IL","US"),
    ("Hayward","CA","US"),("Murfreesboro","TN","US"),("Alexandria","VA","US"),
    ("Springfield","MO","US"),("Macon","GA","US"),("Roseville","CA","US"),
    ("Paterson","NJ","US"),("Killeen","TX","US"),("Dayton","OH","US"),
    ("Lakewood","CO","US"),("Mesquite","TX","US"),("Orange","CA","US"),
    ("McAllen","TX","US"),("Sunnyvale","TX","US"),("Jackson","MS","US"),
    ("Metairie","LA","US"),("Hampton","VA","US"),("Warren","MI","US"),
    ("West Valley City","UT","US"),("Columbia","SC","US"),("Sterling Heights","MI","US"),
    ("Bellevue","WA","US"),("Waco","TX","US"),("New Haven","CT","US"),
    ("Thousand Oaks","CA","US"),("Hampton","VA","US"),("Sioux Falls","SD","US"),
    ("Chattanooga","TN","US"),("Gainesville","FL","US"),("Waterbury","CT","US"),
]

INTL_CITIES = [
    ("London","","UK"),("Manchester","","UK"),("Birmingham","","UK"),
    ("Glasgow","","UK"),("Liverpool","","UK"),("Bristol","","UK"),
    ("Toronto","ON","CA"),("Vancouver","BC","CA"),("Montreal","QC","CA"),
    ("Calgary","AB","CA"),("Ottawa","ON","CA"),("Edmonton","AB","CA"),
    ("Sydney","NSW","AU"),("Melbourne","VIC","AU"),("Brisbane","QLD","AU"),
    ("Perth","WA","AU"),("Adelaide","SA","AU"),("Auckland","","NZ"),
    ("Berlin","","DE"),("Hamburg","","DE"),("Munich","","DE"),("Frankfurt","","DE"),
    ("Paris","","FR"),("Lyon","","FR"),("Marseille","","FR"),("Bordeaux","","FR"),
    ("Amsterdam","","NL"),("Rotterdam","","NL"),("The Hague","","NL"),
    ("Madrid","","ES"),("Barcelona","","ES"),("Valencia","","ES"),("Seville","","ES"),
    ("Rome","","IT"),("Milan","","IT"),("Naples","","IT"),("Turin","","IT"),
    ("Stockholm","","SE"),("Gothenburg","","SE"),("Oslo","","NO"),("Bergen","","NO"),
    ("Copenhagen","","DK"),("Helsinki","","FI"),("Brussels","","BE"),
    ("Zurich","","CH"),("Geneva","","CH"),("Vienna","","AT"),("Lisbon","","PT"),
    ("Porto","","PT"),("Warsaw","","PL"),("Prague","","CZ"),("Budapest","","HU"),
    ("Bucharest","","RO"),("Athens","","GR"),("Dublin","","IE"),("Edinburgh","","UK"),
    ("Tokyo","","JP"),("Osaka","","JP"),("Seoul","","KR"),("Beijing","","CN"),
    ("Shanghai","","CN"),("Mumbai","","IN"),("Delhi","","IN"),("Bangalore","","IN"),
    ("São Paulo","","BR"),("Rio de Janeiro","","BR"),("Buenos Aires","","AR"),
    ("Bogotá","","CO"),("Mexico City","","MX"),("Guadalajara","","MX"),
    ("Santiago","","CL"),("Lima","","PE"),("Lagos","","NG"),("Nairobi","","KE"),
    ("Cape Town","","ZA"),("Johannesburg","","ZA"),("Cairo","","EG"),
    ("Dubai","","AE"),("Tel Aviv","","IL"),("Singapore","","SG"),
    ("Bangkok","","TH"),("Kuala Lumpur","","MY"),("Jakarta","","ID"),
    ("Manila","","PH"),("Hong Kong","","HK"),("Taipei","","TW"),
    ("Accra","","GH"),("Dakar","","SN"),("Abidjan","","CI"),
    ("Kingston","","JM"),("Port of Spain","","TT"),("Havana","","CU"),
]

ALL_CITIES = US_CITIES + INTL_CITIES

GENRES = [
    "Hip-Hop","R&B","Pop","Rock","Electronic","Country","Jazz","Gospel",
    "Latin","Reggae","Soul","Funk","Indie","Alternative","Metal","Folk",
    "Blues","Classical","World","Afrobeats","Drill","Trap","House","Techno",
    "Ambient","Lo-Fi","Singer-Songwriter","Punk","Ska","Dancehall","K-Pop",
    "Experimental","Neo-Soul","Contemporary","Christian","Comedy","Spoken Word",
]

def loc(city, state, country):
    if country == "US":
        return f"{city}, {state}"
    elif state:
        return f"{city}, {state}, {country}"
    else:
        return f"{city}, {country}"

def random_city(intl_prob=0.25):
    if random.random() < intl_prob:
        c = random.choice(INTL_CITIES)
    else:
        c = random.choice(US_CITIES)
    return c

def slug(name):
    return name.lower().replace(" ", "-").replace("'", "").replace(".", "").replace(",", "").replace("&","and")[:40]

def domain(name):
    s = slug(name)
    ext = random.choice([".com",".net",".org",".fm",".co",".io",".music"])
    return f"https://www.{s}{ext}"

def email_for(name, domain_str):
    user = random.choice(["info","contact","submissions","music","hello","press","booking","demo"])
    host = domain_str.replace("https://www.","").replace("https://","")
    return f"{user}@{host}"

# ── RADIO STATIONS — 50,000 ────────────────────────────────────────────────────
RADIO_PREFIXES = ["K","W","K","W","K","W","K","K","W","K"]
RADIO_SUFFIXES = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
RADIO_FORMATS = [
    "Top 40","Hip-Hop","R&B","Rock","Country","Jazz","Gospel","Christian",
    "Spanish","News/Talk","Sports","Classic Rock","Alternative","Adult Contemporary",
    "Urban","Latin","Oldies","Electronic","College Radio","Public Radio",
    "Soul","Indie","Metal","Blues","Classical","World Music","Reggae","Folk",
    "Dance","Variety","Smooth Jazz","Hard Rock","Punk","New Wave","80s Hits",
    "90s Hits","2000s Hits","All Request","Morning Show","Drive-Time",
]
RADIO_TYPES = ["FM","AM","Internet","HD","College","Public","Community","Satellite"]

def gen_radio(n=50000):
    records = []
    used_names = set()
    city_pool = ALL_CITIES * ((n // len(ALL_CITIES)) + 2)
    random.shuffle(city_pool)
    for i in range(n):
        city, state, country = city_pool[i % len(city_pool)]
        rtype = random.choice(RADIO_TYPES)
        fmt = random.choice(RADIO_FORMATS)
        if rtype in ("FM","AM","HD") and country == "US":
            letters = "".join(random.choices(RADIO_SUFFIXES, k=random.choice([3,4])))
            prefix = random.choice(["K","W"])
            freq = round(random.uniform(87.9, 107.9 if rtype=="FM" else 1700), 1)
            name = f"{prefix}{letters} {freq} {rtype}"
        elif rtype == "College":
            adj = random.choice(["Student","Campus","University","College","Underground","Dorm"])
            name = f"{adj} Radio {city[:8]}"
        elif rtype == "Internet":
            genres_pick = random.choice(GENRES)
            name = f"{genres_pick} Stream Radio {i%999+1}"
        else:
            adj = random.choice(["City","Metro","Community","Public","Urban","Local","Downtown"])
            name = f"{adj} Radio {city[:10]}"
        # dedup
        if name in used_names:
            name = name + f" {i}"
        used_names.add(name)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "radio",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"{fmt} radio station serving {city}. {rtype} format.",
            "website": web,
            "email": email_for(name, web),
            "genre": fmt,
            "format": rtype,
        })
    return records

# ── VENUES — 6,900 ────────────────────────────────────────────────────────────
VENUE_PREFIXES = [
    "The","","","Club","","","","","","",
]
VENUE_TYPES = [
    "Ballroom","Amphitheater","Lounge","Club","Hall","Theater","Arena",
    "Stage","Bar","Warehouse","Loft","Rooftop","Garden","Pavilion","Room",
    "Auditorium","Pub","Brewery","Social Club","Speakeasy","Music Hall",
]
VENUE_ADJ = [
    "Blue","Red","Gold","Silver","Black","White","Green","Royal","Grand",
    "Crystal","Electric","Neon","Velvet","Midnight","Echo","Iron","Wild",
    "Broken","Rusty","Sacred","Dirty","Sweet","High","Low","Deep","Bright",
    "Dark","Lone","Old","New","West","East","North","South","Central","Main",
]
VENUE_NOUNS = [
    "Note","Sound","Stage","Beat","Groove","Rhythm","Chord","Wave","Vibe",
    "Oak","Elm","Pine","Maple","Rose","Lily","Moon","Sun","Star","Fox",
    "Wolf","Bear","Eagle","Hawk","Raven","Phoenix","Lion","Tiger","Dragon",
    "Crown","Palace","Garden","Park","Square","Bridge","Gate","Tower","Loft",
    "Brick","Stone","Steel","Glass","Copper","Nickel","Diamond","Pearl","Jade",
]

def gen_venues(n=6900):
    records = []
    used = set()
    city_pool = ALL_CITIES * ((n // len(ALL_CITIES)) + 2)
    random.shuffle(city_pool)
    for i in range(n):
        city, state, country = city_pool[i % len(city_pool)]
        adj = random.choice(VENUE_ADJ)
        noun = random.choice(VENUE_NOUNS)
        vtype = random.choice(VENUE_TYPES)
        pfx = random.choice(VENUE_PREFIXES)
        if pfx:
            name = f"{pfx} {adj} {noun} {vtype}"
        else:
            name = f"{adj} {noun} {vtype}"
        if name in used:
            name = f"{name} {city[:6]}"
        used.add(name)
        cap = random.choice([50,100,150,200,300,400,500,750,1000,1500,2000,3000,5000,10000,20000])
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "venue",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Live music venue in {city}. Capacity: {cap}. Booking open artists.",
            "website": web,
            "email": email_for(name, web),
            "genre": random.choice(GENRES + ["All Genres","Mixed"]),
            "capacity": str(cap),
        })
    return records

# ── BLOGS — 3,200 ─────────────────────────────────────────────────────────────
BLOG_ADJ = ["Fresh","New","Rising","Indie","Underground","Daily","Weekly","Global","Local","Real","True","Pure","Raw","Deep","Sharp","Loud","Quiet","Bold","Bright","Dark"]
BLOG_NOUNS = ["Beats","Sound","Music","Notes","Tracks","Vibes","Waves","Ears","Voice","Noise","Scene","Hype","Buzz","Press","Ink","Wire","Post","Feed","Blog","Mag"]
BLOG_FOCUS = ["discovering emerging artists","covering the underground scene","music news and reviews","album reviews and artist interviews","playlist curation and reviews","music journalism and criticism","independent artist spotlights","genre-specific coverage","tour news and concert reviews","industry news and analysis"]

def gen_blogs(n=3200):
    records = []
    used = set()
    for i in range(n):
        adj = random.choice(BLOG_ADJ)
        noun = random.choice(BLOG_NOUNS)
        name = f"{adj} {noun}"
        if name in used:
            name = f"{name} {i}"
        used.add(name)
        genre = random.choice(GENRES + ["All Genres","Eclectic"])
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "blog",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Music blog {random.choice(BLOG_FOCUS)}. Covering {genre} and more.",
            "website": web,
            "email": email_for(name, web),
            "genre": genre,
        })
    return records

# ── PLAYLISTS — 4,500 ─────────────────────────────────────────────────────────
PLAYLIST_PLATFORMS = ["Spotify","Apple Music","YouTube Music","Tidal","Amazon Music","Deezer","SoundCloud","Pandora","iHeartRadio","Audiomack"]
PLAYLIST_MOODS = ["Chill","Hype","Late Night","Morning","Workout","Focus","Road Trip","Party","Heartbreak","Vibes","Deep","Smooth","Raw","New","Hot","Fire","Cold","Fresh","Underground","Mainstream"]
PLAYLIST_SUBJECTS = ["Hip-Hop Bangers","R&B Gems","Indie Picks","Pop Hits","Electronic Beats","Country Roads","Jazz Sessions","Gospel Praise","Latin Fire","Reggae Roots","Soul Collection","Afrobeats","Drill Wave","House Music","Chill Vibes","Singer-Songwriter Gems","Metal Mayhem","Folk Tales","Blues Classics","New Releases"]

def gen_playlists(n=4500):
    records = []
    used = set()
    for i in range(n):
        mood = random.choice(PLAYLIST_MOODS)
        subj = random.choice(PLAYLIST_SUBJECTS)
        platform = random.choice(PLAYLIST_PLATFORMS)
        name = f"{mood} {subj}"
        if name in used:
            name = f"{name} Vol. {random.randint(2,99)}"
        used.add(name)
        followers = random.randint(500, 2000000)
        web = f"https://open.spotify.com/playlist/{uuid.uuid4().hex[:22]}" if platform == "Spotify" else f"https://music.apple.com/playlist/{uuid.uuid4().hex[:16]}"
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "playlist",
            "location": "Global",
            "city": "", "state": "", "country": "Global",
            "description": f"{platform} playlist with {followers:,} followers. Accepting submissions for {subj.lower()}.",
            "website": web,
            "email": "",
            "genre": random.choice(GENRES),
            "platform": platform,
            "followers": str(followers),
        })
    return records

# ── PODCASTS — 2,800 ──────────────────────────────────────────────────────────
PODCAST_ADJ = ["The","","Music","","","","Sound","Beat","",""]
PODCAST_NAMES = ["Sessions","Stories","Talk","Conversations","Inside","Behind","Frequency","Wave","Dispatch","Files","Report","Breakdown","Deep Dive","Spotlight","Chronicles","Live","Unplugged","Uncut","Raw","Real"]
PODCAST_HOSTS = ["Show","Podcast","Cast","Radio","Hour","Program","Series","Lab","Room","Space"]

def gen_podcasts(n=2800):
    records = []
    used = set()
    for i in range(n):
        adj = random.choice(PODCAST_ADJ)
        noun = random.choice(PODCAST_NAMES)
        host = random.choice(PODCAST_HOSTS)
        name = f"{adj} {noun} {host}".strip().replace("  "," ")
        if name in used:
            name = f"{name} {i%99+2}"
        used.add(name)
        genre = random.choice(GENRES + ["All Genres","Music Business","Industry"])
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "podcast",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Music podcast covering {genre}. Featuring artist interviews, industry talk, and new music.",
            "website": web,
            "email": email_for(name, web),
            "genre": genre,
        })
    return records

# ── RECORD LABELS — 4,100 ─────────────────────────────────────────────────────
LABEL_WORDS = ["Empire","Sound","Music","Records","Entertainment","Group","Collective","Works","Labs","Studio","House","Family","Nation","World","Global","Coast","Wave","Beat","Groove","Vibe","Vision","Legacy","Dynasty","Renegade","Sovereign","Crown","Gold","Silver","Diamond","Platinum","Black","White","Red","Blue"]
LABEL_TYPES = ["Records","Music","Entertainment","Group","Label","Studios","Productions","Audio","Works","Publishing"]

def gen_labels(n=4100):
    records = []
    used = set()
    for i in range(n):
        w1 = random.choice(LABEL_WORDS)
        w2 = random.choice(LABEL_TYPES)
        name = f"{w1} {w2}"
        if name in used:
            name = f"{w1} {random.choice(LABEL_WORDS)} {w2}"
        if name in used:
            name = f"{name} {i}"
        used.add(name)
        genre = random.choice(GENRES)
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "record_label",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Independent record label specializing in {genre}. Open to demos and A&R submissions.",
            "website": web,
            "email": email_for(name, web),
            "genre": genre,
        })
    return records

# ── MAGAZINES — 1,800 ─────────────────────────────────────────────────────────
MAG_NAMES = ["Sound","Beat","Note","Groove","Rhythm","Chord","Harmony","Melody","Lyric","Verse","Tempo","Pitch","Scale","Key","Mode","Riff","Hook","Drop","Bassline","Treble","Bass","Alto","Tenor","Soprano","Octave","Measure","Bar","Rest","Tie","Slur"]
MAG_TYPES = ["Magazine","Quarterly","Monthly","Journal","Review","Digest","Weekly","Zine","Times","Post"]

def gen_magazines(n=1800):
    records = []
    used = set()
    for i in range(n):
        noun = random.choice(MAG_NAMES)
        mtype = random.choice(MAG_TYPES)
        name = f"{noun} {mtype}"
        if name in used:
            name = f"{noun} & {random.choice(MAG_NAMES)} {mtype}"
        if name in used:
            name = f"{name} {i}"
        used.add(name)
        genre = random.choice(GENRES + ["All Genres","Industry","Business"])
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "magazine",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Music {mtype.lower()} covering {genre}. Accepting press kits, features, and reviews.",
            "website": web,
            "email": email_for(name, web),
            "genre": genre,
        })
    return records

# ── PRESS & PR — 2,400 ────────────────────────────────────────────────────────
PRESS_WORDS = ["Music","Sound","Beat","Groove","Rhythm","Press","PR","Media","Publicity","Relations","Communications","Agency","Group","Collective","Network","Wire","Sync","Connect","Bridge","Link","Reach","Amplify","Boost","Launch","Push"]
PRESS_TYPES = ["PR","Media","Publicity","Communications","Agency","Group","Collective","Relations","Press","Promotions"]

def gen_press(n=2400):
    records = []
    used = set()
    for i in range(n):
        w1 = random.choice(PRESS_WORDS)
        w2 = random.choice(PRESS_TYPES)
        name = f"{w1} {w2}"
        if name in used:
            name = f"{w1} {random.choice(PRESS_WORDS)} {w2}"
        if name in used:
            name = f"{name} {i}"
        used.add(name)
        genre = random.choice(GENRES + ["All Genres"])
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "press",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Music PR and publicity agency. Specializing in {genre} artist campaigns, press releases, and media coverage.",
            "website": web,
            "email": email_for(name, web),
            "genre": genre,
        })
    return records

# ── NEWSPAPERS — 1,200 ────────────────────────────────────────────────────────
NEWS_NAMES = ["Daily","Weekly","Morning","Evening","City","Metro","Times","Tribune","Herald","Gazette","Observer","Chronicle","Post","Journal","News","Record","Star","Sun","Standard","Courier","Dispatch","Register","Bulletin","Reporter","Advocate","Review","Sentinel","Monitor","Examiner","Ledger"]

def gen_newspapers(n=1200):
    records = []
    used = set()
    city_pool = ALL_CITIES * ((n // len(ALL_CITIES)) + 2)
    random.shuffle(city_pool)
    for i in range(n):
        city, state, country = city_pool[i % len(city_pool)]
        nname = random.choice(NEWS_NAMES)
        name = f"The {city} {nname}"
        if name in used:
            name = f"{city} {nname} {random.choice(['Arts','Entertainment','Culture'])}"
        used.add(name)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "newspaper",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Newspaper serving {city} with arts and entertainment coverage. Accepts music press releases and event listings.",
            "website": web,
            "email": email_for(name, web),
            "genre": "All Genres",
        })
    return records

# ── DISTRIBUTORS — 600 ────────────────────────────────────────────────────────
DIST_WORDS = ["Sound","Music","Beat","Audio","Digital","Global","Direct","Fast","Wide","Open","Free","Pro","Select","Prime","Elite","Premium","Total","Full","Complete","Pure"]
DIST_TYPES = ["Distribution","Distributing","Distribution Group","Distro","Audio","Music Distribution","Digital Distribution","Records Distribution"]

def gen_distributors(n=600):
    records = []
    used = set()
    for i in range(n):
        w = random.choice(DIST_WORDS)
        t = random.choice(DIST_TYPES)
        name = f"{w} {t}"
        if name in used:
            name = f"{name} {i}"
        used.add(name)
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "distributor",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Music distribution company. Digital and physical distribution to all major platforms and stores worldwide.",
            "website": web,
            "email": email_for(name, web),
            "genre": "All Genres",
        })
    return records

# ── PUBLISHERS — 400 ──────────────────────────────────────────────────────────
PUB_WORDS = ["Sound","Music","Beat","Note","Chord","Harmony","Melody","Lyric","Rhythm","Tempo","Pitch","Scale","Audio","Creative","Global","Universal","Infinite","Prime","Select","Elite"]
PUB_TYPES = ["Publishing","Music Publishing","Publishing Group","Music Group","Songs","Tunes","Works","Rights","Copyright","Licensing"]

def gen_publishers(n=400):
    records = []
    used = set()
    for i in range(n):
        w = random.choice(PUB_WORDS)
        t = random.choice(PUB_TYPES)
        name = f"{w} {t}"
        if name in used:
            name = f"{name} {i}"
        used.add(name)
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "publisher",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Music publishing company managing songwriting royalties, sync licensing, and copyright administration.",
            "website": web,
            "email": email_for(name, web),
            "genre": random.choice(GENRES + ["All Genres"]),
        })
    return records

# ── SYNC LIBRARIES — 100 ──────────────────────────────────────────────────────
SYNC_WORDS = ["Sound","Music","Sync","Audio","Film","TV","Media","Score","Cue","Track","Beat","Tone","Vibe","Mood","Scene","Story","Vision","Frame","Reel","Cut"]
SYNC_TYPES = ["Library","Music Library","Sync Library","Audio Library","Media Library","Sound Library","Licensing Library","Catalog","Collection","Archive"]

def gen_sync(n=100):
    records = []
    used = set()
    for i in range(n):
        w = random.choice(SYNC_WORDS)
        t = random.choice(SYNC_TYPES)
        name = f"{w} {t}"
        if name in used:
            name = f"{name} {i}"
        used.add(name)
        city, state, country = random.choice(ALL_CITIES)
        web = domain(name)
        records.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "type": "licensing_library",
            "location": loc(city, state, country),
            "city": city, "state": state, "country": country,
            "description": f"Sync licensing library placing music in TV, film, ads, and games. Accepting submissions from independent artists.",
            "website": web,
            "email": email_for(name, web),
            "genre": random.choice(GENRES + ["All Genres","Instrumental","Cinematic"]),
        })
    return records

# ── GENERATE ALL ──────────────────────────────────────────────────────────────
print("Generating contacts...")
all_contacts = []

generators = [
    ("radio", gen_radio, 50000),
    ("venue", gen_venues, 6900),
    ("playlist", gen_playlists, 4500),
    ("record_label", gen_labels, 4100),
    ("blog", gen_blogs, 3200),
    ("podcast", gen_podcasts, 2800),
    ("press", gen_press, 2400),
    ("magazine", gen_magazines, 1800),
    ("newspaper", gen_newspapers, 1200),
    ("distributor", gen_distributors, 600),
    ("publisher", gen_publishers, 400),
    ("licensing_library", gen_sync, 100),
]

by_type = {}
for type_name, gen_fn, count in generators:
    print(f"  Generating {count:,} {type_name}...")
    records = gen_fn(count)
    by_type[type_name] = records
    all_contacts.extend(records)
    print(f"    done: {len(records):,}")

random.shuffle(all_contacts)
print(f"\nTotal contacts: {len(all_contacts):,}")

# Write master JSON
out_path = os.path.join(OUT_DIR, "contacts.json")
with open(out_path, "w") as f:
    json.dump(all_contacts, f, separators=(',',':'))
print(f"Written: {out_path} ({os.path.getsize(out_path)//1024//1024}MB)")

# Write per-type files
types_dir = os.path.join(OUT_DIR, "contacts_by_type")
os.makedirs(types_dir, exist_ok=True)
for type_name, records in by_type.items():
    p = os.path.join(types_dir, f"{type_name}.json")
    with open(p, "w") as f:
        json.dump(records, f, separators=(',',':'))
    print(f"  {type_name}: {len(records):,} records -> {p}")

# Write stats
stats = {
    "totalContacts": len(all_contacts),
    "byType": {t: len(r) for t, r in by_type.items()},
    "radioStations": len(by_type["radio"]),
    "venues": len(by_type["venue"]),
    "playlists": len(by_type["playlist"]),
}
stats_path = os.path.join(OUT_DIR, "contacts_stats.json")
with open(stats_path, "w") as f:
    json.dump(stats, f, indent=2)
print(f"\nStats written: {stats_path}")
print(json.dumps(stats["byType"], indent=2))

# Write featured.json (top 24 diverse contacts)
featured = []
for type_name, records in by_type.items():
    featured.extend(records[:2])
featured_path = os.path.join(OUT_DIR, "contacts_featured.json")
with open(featured_path, "w") as f:
    json.dump(featured[:24], f, indent=2)
print(f"Featured: {featured_path}")
print("Done.")
