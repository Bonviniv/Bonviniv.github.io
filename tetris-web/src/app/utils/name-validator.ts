export class NameValidator {
  static validateUsername(name: string): boolean {
    // Only allow A-Z characters, 1-5 letters
    if (!/^[A-Z]{1,5}$/.test(name)) {
      return false;
    }

    // Basic restricted patterns (add more as needed)
    const restrictedPatterns = [
     "ASS", "PIRU", "CUZAO", "BOSTA", "PENIS", "VAGAS", "PUTA", "PORRA", "PAU", "CU", "COCO",
    "MERDA", "FDP", "CARAL", "PIRRA", "BUCET", "XEREC", "PUTIN", "FUDER", "BIXA", "VIADO",
    "ASSHO", "BITCH", "CRAP", "DICKS", "FAG", "SLUT", "PUSSY", "CUM", "SHIT", "TITS",
    "FUCK", "DICK", "CUNT", "TWAT", "NAZI", "RACIS", "WHORE", "NIGGA", "NIGER", "IDIOT",
    "LOSER", "STUPD", "KILLY", "HELL", "DAMN", "MOFO", "MORON", "GAY", "HOMO","IDIOT", "FDP",
     "BURRO", "OTARI", "CAGAO", "CUZAO", "MERDA", "BOSTA", "TROXA", "CANAL",
    "TROLO", "BOBO", "FDPZ", "PUTO", "PUTA", "PALHA", "NOJO", "RANCO", "DROGA", "MALU",
    "PIRUA", "SEXO", "CORNA", "CORNO", "RABAO", "VADIA", "VAGAB", "IDIOT", "DUMBO", "SADIC",
    "STUPD", "LOSER", "DUMMY", "TRASH", "SCUM", "JERK", "SUCKS", "WEIRD", "WASTE", "SILLY",
    "NASTY", "CRAZY", "CREEP", "MORON", "FREAK", "STINK", "TOXIC", "BASTD", "WITCH", "SLUTY",
    "BITCZ", "DARKY", "STUPD", "TRAMP", "CRACK", "WHORE", "DIRTY", "SUCKY", "BLOOD", "PENIS",
    "VAGNA", "HORNY", "COCKS", "SPOOG", "SEXXX", "HOMO", "LESBO", "ANAL", "SNUFF", "NUTTS",
    "DICKS", "SHEIT", "FAKER", "JUNKS", "TURDS", "PISSY", "TITTY", "BOOBS", "HUMPS", "DRUNK",
    "BANGR", "BONER", "FUKER", "DIEGO", "MATAU", "MORTE", "CUMMO", "FUMAR", "XOTA", "PUTIN",
    "NABAS", "DEMON", "HELLZ", "INFER", "SADIS", "GRAVE", "CEMIT", "BRUTA", "ZOMBI", "GOREY",
    "ARSE", "ASSH", "BANG", "BICH", "BLOW", "BOZO", "BUGR", "BURR", "CHUP", "COCK",
    "CORN", "COTA", "CREU", "CRUZ", "CRAC", "CRAP", "CUME", "CUZA", "CUZO", "CACA",
    "DAFU", "DAMN", "DICK", "DOLE", "DOPE", "DROL", "DRUG", "ESCU", "FACK", "FAKE",
    "FART", "FCKR", "FDPZ", "FEIA", "FEIO", "FEUC", "FICA", "FODA", "FRAU", "FUDE",
    "FUDI", "FUDU", "FUKK", "FUKU", "GADA", "GADO", "GAYS", "GEYZ", "GOZE", "GRRR",
    "GROO", "HATE", "HELL", "HOMO", "IDIQ", "IDIU", "IDIY", "JAPA", "JAPA", "JERK",
    "KILL", "KOCK", "KOKO", "KRAM", "LAMA", "LIXO", "LOCO", "LUCA", "LUCO", "MACA",
    "MADR", "MALA", "MARI", "MERD", "MIJO", "MOFO", "MULA", "MULA", "MUTA", "NADA",
    "NAZI", "NERD", "NIGR", "NOJO", "NORT", "ORGI", "ORCA", "ORGY", "OTAR", "PACA",
    "PALA", "PASP", "PAUS", "PENE", "PENI", "PEPE", "PESO", "PILA", "PILA", "PILA",
    "PILA", "PINT", "PIRO", "PODR", "POOP", "PORC", "PORN", "POTA", "PUTA", "PUTO",
    "PUXA", "PUXO", "PUSY", "RAFA", "RATO", "RATA", "RIBA", "ROLA", "ROTO", "RUIN",
    "SACO", "SAFO", "SEGA", "SEIO", "SEME", "SETA", "SEXO", "SHIT", "SIRU", "SOGA",
    "SORO", "SUJA", "SUJO", "TETA", "TETA", "TETI", "TETU", "TETO", "TETA", "TEST",
    "TOBA", "TOLA", "TOLO", "TOSO", "TROL", "TUPA", "TUTO", "URUB", "URIN", "VACA",
    "VAGI", "VEAD", "VIRA", "VIRO", "VIAD", "VIRA", "XANA", "XATO", "XERE", "XING",
    "XOXA", "XUCA", "XUPA", "ZERA", "ZOIO", "ZOZO", "ZUEI", "ZURO", "ZIKA", "ZONA",
    "ZORR", "ZOUU", "ZUNZ", "ZZZZ", "FECU", "FERO", "FUZO", "GALO", "FARI", "BOLA",
    "FADA", "LOLA", "ZADA", "ZADO", "TOZO", "GOGO", "CUNH", "BROC", "KUKA", "MEIO",
    "ABORT", "ABUSA", "ABUSO", "ANALU", "ANALY", "ANALC", "ANOTA", "ANUSO", "ARGUA",
    "ARROM", "ATRAS", "AXILA", "BABAC", "BAFOS", "BARRO", "BASTA", "BAZAR", "BEBUM",
    "BESOU", "BICHA", "BICHO", "BILAU", "BOCET", "BOLAG", "BOSTA", "BRAZA", "BUNDA",
    "BURRA", "BURRO", "BUTEK", "CAGAD", "CAGOU", "CAIRU", "CARAI", "CARAL", "CAVAL",
    "CETIC", "CHANA", "CHAPA", "CHERE", "CHIFR", "CHUPA", "CHUTA", "CLITO", "COISA",
    "CORNA", "CORNO", "CRETI", "CRUEL", "CULEI", "CULHA", "CULHO", "CUNHA", "CUZIL",
    "DEBIL", "DEMON", "DENTE", "DILDO", "DINGA", "DOIDO", "DROGA", "DROGU", "EBOLA",
    "EGITO", "ESGAN", "ESGOT", "EXCRE", "FALOS", "FARDA", "FEDER", "FEIAS", "FEIOS",
    "FELAD", "FELIA", "FERIR", "FETOS", "FINGE", "FIXAR", "FODAC", "FODAO", "FODAS",
    "FODER", "FODEU", "FODID", "FOFOC", "FRACA", "FRACO", "FUDAM", "FUDAS", "FUDER",
    "FUDEU", "FUDID", "FUJAM", "FUJAS", "FUJOI", "FURAO", "FURAR", "FURIA", "FURON",
    "GADIA", "GADJO", "GAYZA", "GEICE", "GENTE", "GOLPE", "GRANA", "GRITO", "GROSS",
    "GRUTA", "GUETO", "HOMEN", "HONRA", "HORAS", "IDIOT", "IGUAL", "ILUDI", "IMBEC",
    "INFEL", "INSAN", "INSEU", "INSEX", "INTRA", "IRADA", "IRADO", "IRRIT", "JEGUE",
    "JOGAD", "KIBRA", "KUNTA", "KUNTS", "LADRA", "LADRO", "LAGAR", "LAMEU", "LENTO",
    "LERDO", "LESBI", "LIXAR", "LOBAS", "LOIRA", "LOIRO", "LOUCA", "LOUCO", "LOUSA",
    "LUCRA", "LUTAR", "MACON", "MADRA", "MAFIA", "MALDA", "MALUC", "MANDA", "MANDA",
    "MANJA", "MASSA", "MEDRO", "MERDA", "MIJAR", "MIJOU", "MOLHA", "MORTE", "MOSCA",
    "NAZIS", "NERDA", "NOJEN", "NOJOS", "NUDES", "NUTEL", "OBESO", "ÓDIOZ", "ORGIA",
    "OTARI", "PAGAO", "PAIXA", "PANEL", "PARDI", "PASSA", "PAUZA", "PAUZA", "PENAS",
    "PELOS", "PEMBA", "PERVE", "PESAD", "PILAR", "PIRAN", "PIROU", "PODRE", "POFAS",
    "POMPO", "PORNO", "PRETA", "PRETO", "PROST", "PUNHA", "PUNHO", "PUTAI", "PUTYZ",
    "RAIVA", "RAPAD", "RATOS", "RETAR", "RIDIC", "RIMAR", "ROUBO", "RUMOS", "RUSTA",
    "SADIC", "SAFAD", "SAFAS", "SANGU", "SENTI", "SIFIL", "SIRIR", "SOCAR", "SOCOU",
    "SODOM", "SORNA", "SPERM", "SUFOC", "SUSTO", "TALAR", "TESAO", "TESTA", "TESUD",
    "TOSCO", "TRAVA", "TREPA", "TROLL", "TROPA", "TUMBA", "VACAS", "VADIA", "VADIO"
    ];

    return !restrictedPatterns.includes(name);
  }
}
