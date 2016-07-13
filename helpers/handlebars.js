function exphbsHelpers(exphbs) {
  // Handlebars helper for our dashboard layout
  // will be used to detect page titles and make the link nav bar links .active
  return exphbs.create({ 
    helpers: {
        if_eq: function(a, b, opts) {
          if(a === b) 
            return opts.fn(this);
          else
            return opts.inverse(this);
       }
    },
    defaultLayout: 'layout',
  });
}

module.exports = exphbsHelpers;
