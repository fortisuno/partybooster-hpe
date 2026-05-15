import type { Card } from '../types/card.js';

export const HARRY_POTTER_CARDS: Card[] = [
  {
    name: "Incarcarous",
    house: "Ravenclaw",
    description:
      "¡Atadura! Durante 3 turnos, obliga a los magos a atar sus manos.  Todos participan; el que no ate sus manos, bebe 1 trago.",
    houseAdvantage: "Ravenclaws pueden eximirse de la atadura",
    isCounter: false,
  },
  {
    name: "Muffliato",
    house: "Ravenclaw",
    description:
      "¡Silencio! Durante 3 turnos, no se puede hablar en voz alta. Si algun mago habla en voz alta, bebe 1 trago.",
    houseAdvantage: "Ravenclaws pueden hablar en voz alta.",
    isCounter: true,
  },
  {
    name: "Incarcarous",
    house: "Slytherin",
    description:
      "¡Atadura! Durante 3 turnos, ata tus manos con las de tu vecino. Todos participan; quienes las despeguen, beben 1 trago.",
    houseAdvantage: "Slytherins eligen a quién atar.",
    isCounter: false,
  },
  {
    name: "Densaugeo",
    house: "Slytherin",
    description:
      "¡Dientes! Durante 3 turnos, nadie puede mostrar los dientes al hablar.  Todos participan; el que no, bebe 1 trago.",
    houseAdvantage: "Slytherins pueden duplica los tragos.",
    isCounter: false,
  },
  {
    name: "Defodio",
    house: "Slytherin",
    description:
      "¡Talla! Durante 3 turnos, Todos los magos deben cantar mientras hablan. Todos participan; el que no, bebe 1 trago.",
    houseAdvantage: "Slytherins eligen el estilo musical.",
    isCounter: false,
  },
  {
    name: "Protego",
    house: "Gryffindor",
    description: "¡Escudo! Anula el efecto de la carta de Dumbuldore",
    houseAdvantage: "Refleja el hechizo hacia quien lo lanzó.",
    isCounter: true,
  },
  {
    name: "Dumbuldore",
    house: "Gryffindor",
    description:
      "¡Felicidades! haz sido proclamado el nuevo director de Hogwarts. Crea una ley procura que sea justa y que la mayoria de la mesa apruebe. Cada vez que se inclumpla tu ley el jugador infractor bebera 1 trago. Tu ley y reinado es vigente hasta que se proclame un nuevo Rey",
    houseAdvantage: "Los Gryffindor y Hufflepuff beben la mitad del castigo .",
    isCounter: true,
  },
  {
    name: "Minerva McGonagall",
    house: "Gryffindor",
    description:
      "¡Felicidades! haz sido proclamado el nuevo director de Hogwarts. Crea una ley procura que sea justa y que la mayoria de la mesa apruebe. Cada vez que se inclumpla tu ley el jugador infractor bebera 1 trago. Tu ley y reinado es vigente hasta que se proclame un nuevo Rey",
    houseAdvantage: "Los Gryffindor y Hufflepuff beben la mitad del castigo .",
    isCounter: true,
  },
  {
    name: "Severus Snape",
    house: "Slytherin",
    description:
      "¡Felicidades! haz sido proclamado el nuevo director de Hogwarts. Crea una ley procura que sea justa y que la mayoria de la mesa apruebe. Cada vez que se inclumpla tu ley el jugador infractor bebera 1 trago. Tu ley y reinado es vigente hasta que se proclame un nuevo Rey",
    houseAdvantage: "Los Slytherin y Ravenclaw beben la mitad del castigo .",
    isCounter: true,
  },
  {
    name: "Severus Snape",
    house: "Slytherin",
    description:
      "¡Felicidades! haz sido proclamado el nuevo director de Hogwarts. Crea una ley procura que sea justa y que la mayoria de la mesa apruebe. Cada vez que se inclumpla tu ley el jugador infractor bebera 1 trago. Tu ley y reinado es vigente hasta que se proclame un nuevo Rey",
    houseAdvantage: "Los Slytherin y Ravenclaw beben la mitad del castigo .",
    isCounter: true,
  },
  {
    name: "Aguamenti",
    house: "Gryffindor",
    description:
      "¡Agua! Durante 3 turnos, cada vez que un mago beba debes rellenar su vaso .",
    houseAdvantage:
      "Gryffindors pueden rellenar el vaso del objetivo con tu bebida.",
    isCounter: false,
  },
  {
    name: "Scourgify",
    house: "Hufflepuff",
    description:
      "¡Limpieza! Durante 3 turnos, debes limpiar un las áreas sucia o beber 1 trago.",
    houseAdvantage: "Hufflepuffs pueden delegar la limpieza.",
    isCounter: false,
  },
  {
    name: "Obliviate",
    house: "Slytherin",
    description:
      "¡Olvido! Durante 3 turnos, el mago de tu eleccion debe olvidar su castigo una vez realizado y repetirlo.",
    houseAdvantage: "Slytherins reducen la repeticion a la mitad.",
    isCounter: false,
  },

  {
    name: "Obscuro",
    house: "Slytherin",
    description:
      "¡Vendado! Durante 3 turnos, el mago de tu eleccion debe vendarse los ojos o beber 1 shot.",
    houseAdvantage: "Slytherins deciden si vendar a alguien mas.",
    isCounter: false,
  },
  {
    name: "Deprimo",
    house: "Ravenclaw",
    description: "¡Presión! El mago de tu eleccion debe beber hasta el fondo.",
    houseAdvantage: "Ravenclaws pueden elegir si el mago que se salva.",
    isCounter: false,
  },
  {
    name: "Crucio",
    house: "Slytherin",
    description:
      "¡Dolor! El mago de tu eleccion bebe 3 tragos. los magos a su costado beben 1 trago cada uno",
    houseAdvantage: "Slytherins pueden duplicar los tragos.",
    isCounter: true,
  },
  {
    name: "Sectumsempra",
    house: "Slytherin",
    description: "¡Corte! El mago de tu eleccion bebe 3 tragos.",
    houseAdvantage: "Slytherins pueden aumentar 2 tragos.",
    isCounter: true,
  },
  {
    name: "Tarantallegra",
    house: "Slytherin",
    description:
      "¡Baile! Obligas a 2 magos de tu eleccion a bailar o beber 1 shot.",
    houseAdvantage: "Slytherins pueden elegir la música.",
    isCounter: false,
  },
  {
    name: "Imperio",
    house: "Slytherin",
    description: "¡Orden! Obligas al mago de tu eleccion a beber 2 tragos.",
    houseAdvantage: "Slytherins pueden obligar a dos personas.",
    isCounter: false,
  },
  {
    name: "Reducto",
    house: "Slytherin",
    description: "¡Explosión! Todos los magos beben 3 tragos.",
    houseAdvantage: "Slytherins están exentos.",
    isCounter: false,
  },
  {
    name: "Diffindo",
    house: "Slytherin",
    description:
      "¡Corte! El mago de tu eleccion debe beber la mitad de tu tragos.",
    houseAdvantage: "Gryffindors siempre toman la mayor parte.",
    isCounter: false,
  },
  {
    name: "Mobilicorpus",
    house: "Hufflepuff",
    description:
      "¡Movimiento! El mago de tu eleccion debe cambiar de lugar o beber 3 tragos.",
    houseAdvantage: "Hufflepuffs pueden mover a dos personas.",
    isCounter: false,
  },

  {
    name: "Episkey",
    house: "Gryffindor",
    description:
      "¡Curación! Fuerza al mago de tu eleccion a beber 3 tragos para 'curar' su error.",
    houseAdvantage: "Gryffindors pueden curar a dos personas a la vez.",
    isCounter: true,
  },
  {
    name: "Reparo",
    house: "Gryffindor",
    description:
      "¡Reparación! Fuerza al mago de tu eleccion a beber 3 tragos para 'reparar' su error.",
    houseAdvantage: "Gryffindors pueden forzar 2 tragos.",
    isCounter: true,
  },
  {
    name: "Expulso",
    house: "Gryffindor",
    description:
      "¡Expulsión! Durante 3 turnos, como mago debes beber 3 tragos de brebaje al final del turno, si no quieres hacerlo debes beber 1 shot.",
    houseAdvantage: "Gryffindors pueden elegir a quién expulsar.",
    isCounter: true,
  },
  {
    name: "Avada Kedavra",
    house: "Slytherin",
    description:
      "¡Maldición! El mago de tu eleccion debe beber 1 shot o una turbochela",
    houseAdvantage: "Slytherins pueden sumar 2 tragos más.",
    isCounter: false,
  },
  {
    name: "Expelliarmus",
    house: "Gryffindor",
    description: "¡Desarme! El  mago de tu eleccion debe beber 3 tragos.",
    houseAdvantage: "El objetivo bebe 2 tragos en su lugar.",
    isCounter: true,
  },

  {
    name: "Impedimenta",
    house: "Gryffindor",
    description: "¡Congelar! El mago de tu eleccion debe beber 3 tragos.",
    houseAdvantage: "Gryffindors pueden obligar al objetivo a beber 1 trago.",
    isCounter: true,
  },
  {
    name: "Liberacorpus",
    house: "Gryffindor",
    description:
      "¡Liberación! Liberas al mago de tu eleccion de beber su tragos en los proximos 3 turnos si no liberas a nadie bebes 1 shot.",
    houseAdvantage:
      "Una vez liberado a alguien puedes mandar un shot al mago de tu eleccion",
    isCounter: false,
  },
  {
    name: "Geminio",
    house: "Slytherin",
    description:
      "¡Duplicado! Durante 3 turnos, el mago de tu eleccion bebe el doble de tragos.",
    houseAdvantage: "Slytherins pueden triplicar los tragos.",
    isCounter: false,
  },
  {
    name: "Levicorpus",
    house: "Slytherin",
    description:
      "¡Levitación! Todos los magos deben de ponerse de pie. Todos participan; el ultimo en hacerlo, bebe 1 shot.",
    houseAdvantage: "Slytherins son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Avis",
    house: "Slytherin",
    description:
      "¡Pájaros! Todos los magos deben aletear. Todos participan; el ultimo en hacerlo, bebe 1 shot.",
    houseAdvantage: "Slytherins son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Riddikulus",
    house: "Gryffindor",
    description:
      "¡Boggart! Haz la cara más ridícula . Todos participan; el primero en reírse debe beber 1 shot.",
    houseAdvantage: "Gryffindors son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Erecto",
    house: "Hufflepuff",
    description:
      "¡Estructura! Equilibra tu vaso con algo que no sea la mesa. Todos participan; los que no lo logren beben 1 shot",
    houseAdvantage: "Hufflepuffs son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Anapneo",
    house: "Hufflepuff",
    description:
      "¡Respiración! Todos los magos deben contener la respiración. Todos participan; el que la contenga mas tiempo reparte 1 shot al mago de su eleccion.",
    houseAdvantage: "Hufflepuffs son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Petrificus Totalus",
    house: "Slytherin",
    description:
      "¡Petrificación! Todos los magos deben de permanecer inmoviles, el primero en moverse bebera 1 shot",
    houseAdvantage: "Slytherins son los jueces eligen quién bebe el trago.",
    isCounter: true,
  },
  {
    name: "Accio",
    house: "Hufflepuff",
    description:
      "¡Invocación! Señala un objeto. Todos participan; el último mago en tocarlo bebe 1 shot.",
    houseAdvantage: "Hufflepuffs son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Wingardium Leviosa",
    house: "Hufflepuff",
    description:
      "¡Levitación! Todos los magos levantan un objeto ligero con 1 dedo. Todos participan; el primero que tire el objeto bebe 1 shot.",
    houseAdvantage: "Hufflepuffs son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Portus",
    house: "Hufflepuff",
    description:
      "¡Traslador! Todos los magos deben cambiar de asiento. Todos participan; el último bebe 1 shot.",
    houseAdvantage: "Hufflepuffs son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Lumos",
    house: "Hufflepuff",
    description:
      "¡Luz! Todos los magos deben encender la linterna de su celular o varita. Todos participan; el último bebe 1 shot.",
    houseAdvantage: "Hufflepuffs son los jueces eligen quién bebe el trago.",
    isCounter: false,
  },
  {
    name: "Descendo",
    house: "Hufflepuff",
    description:
      "¡Descenso! Todos los magos deben sentarse en el suelo. Todos participan; el último bebe 1 shot.",
    houseAdvantage: "Hufflepuffs pueden elegir el lugar del suelo.",
    isCounter: false,
  },
  {
    name: "Confundo",
    house: "Slytherin",
    description:
      "¡Confusión! Apunta a un mago hazle una pregunta. Rapidamente y sin contesar, ese jugador debe formular otra pegunta y asi sucesivamente hasta formar una cadena de preguntas. Si la pregunta no es relacionada a HP, el mago se congela o responde la pregunta debe beber 3 tragos de su bebida.",
    houseAdvantage: "Slytherins pueden duplicar el castigo.",
    isCounter: false,
  },
  {
    name: "Homenum Revelio",
    house: "Ravenclaw",
    description:
      "¡Revelación! Por turnos todos deben revelar un secreto. Todos participan; el que no quiera debera beber 3 tragos.",
    houseAdvantage: "Ravenclaws eligen el tema del secreto.",
    isCounter: false,
  },
  {
    name: "Sombrero seleccionador",
    house: "Ravenclaw",
    description:
      "¡El sombrero a hablado! Escoge  una categoria para jugar un caricachupas; el perdedor bebe 3 tragos.",
    houseAdvantage: "Ravenclaws eligen el tema del caricachupas.",
    isCounter: false,
  },
  {
    name: "Impervius",
    house: "Ravenclaw",
    description:
      "¡Historia! Di 1 palabra. El siguiente jugador repetira todas las palabras anteriores en el mismo orden y agregara solamente una palabra. Asi suscesivamente hasta que alguien falle; el perdedor bebe 3 tragos.",
    houseAdvantage: "Ravenclaws eligen el tema de la historia.",
    isCounter: false,
  },
  {
    name: "Expecto Patronum",
    house: "Gryffindor",
    description:
      "¡Patronus! Se jugara una ronda de yo nunca nunca; el que no desee decir bebe 1 shot.",
    houseAdvantage: "Todos los Slytherin deben de decir 2 yo nunca nunca.",
    isCounter: true,
  },
  {
    name: "Finite Incantatem",
    house: "Slytherin",
    description:
      "¡Fin! Discrepo, di una palabra, por turnos cada jugador dira una palabra relacionada con la anteior que escucho, si alguno discrepa debera decir discrepo y si la mayoria discrepala minoria bebe 2 tragos, de lo contrario la mayoria bebe 2 tragos.",
    houseAdvantage: "Slytherin puede duplicar el castigo",
    isCounter: true,
  },
];

export function buildDeck(): Card[] {
  return [...HARRY_POTTER_CARDS];
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}