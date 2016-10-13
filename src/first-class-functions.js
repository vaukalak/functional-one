var { pd } = require('pretty-data2');
const formatXml = pd.xml.bind(pd);

const curry = (f, ...args) => {
  if(args.length >= f.length) {
    return f(...args);
  }
  return (...newArgs) => curry(f, ...args, ...newArgs);
};

const curryN = (n, f, ...args) => {
  if(args.length >= n) {
    return f(...args);
  }
  return (...newArgs) => curryN(n, f, ...args, ...newArgs);
};

const writeMessage = (writer, formatter, message) =>
  writer(
    formatter(
      message
    )
  );

const logXml = curry(writeMessage)(console.log)(formatXml);

const combine =
  (...modifiers) =>
    e =>
      [...modifiers].reverse().reduce((p, t) => t(p), e);

const flatMap = (c, f) => [].concat(...c.map(f));

const createTag = curryN(2, (tagName, ...content) =>
  `<${tagName}>${flatMap(content, e => e).join('')}</${tagName}>`);

const ul = createTag('ul');
const li = createTag('li');
const div = createTag('div');
const a = createTag('a');

const urlListEntry = combine(li, div, a, div);

const messages = {
  hello: `HELLO WORLD`,
  letsRoll: `LET'S ROLL`,
};

const functor = s => ({
  fmap: (f) => functor(f(s)),
  unwrap: () => s,
});

const nothing = {
  fmap: (f) => nothing,
  unwrap: () => undefined,
};

const maybeFunctor = s => ({
  fmap: (f) => {
    if(s === nothing || s === undefined) {
      return nothing;
    }
    return maybeFunctor(f(s));
  },
  unwrap: () => s,
});

const arrayMaybeFunctor = arr => ({
  fmap: f =>
    arrayMaybeFunctor(
      arr.map(
        s => s !== undefined ? f(s) : undefined
      )
    ),
  unwrap: () => arr,
});

const items = arrayMaybeFunctor(['hello', 'letsRoll'])
//const items = maybeFunctor('hello')
  .fmap(s => messages[s])
  .fmap(s => s.toLowerCase())
  .fmap(s => `${s}!!!`)
  .fmap(urlListEntry)
  .unwrap();

logXml(
  ul(
    items
    //item
  )
);