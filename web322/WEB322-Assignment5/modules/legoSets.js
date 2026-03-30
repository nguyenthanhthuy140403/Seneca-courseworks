require('dotenv').config();
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
let sequelize = new Sequelize('SenecaDB', 'nguyenthanhthuy140403', 'EV0hGeaXBm2O', {
  host: 'ep-cold-queen-96579638-pooler.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

// Define the Theme and Set models
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  num_parts: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  theme_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  img_url: {
    type: Sequelize.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Functions for working with the database

function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database synchronized successfully.');
    })
    .catch((err) => {
      console.log('Unable to sync the database:', err);
      throw err; // Propagate the error for further handling
    });
}

function getAllSets() {
  return Set.findAll({ include: [Theme] });
}

function getSetByNum(setNum) {
  return Set.findOne({
    where: { set_num: setNum },
    include: [Theme],
  }).then((foundSet) => {
    if (foundSet) {
      return foundSet;
    } else {
      throw new Error("Unable to find requested set");
    }
  });
}

function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }
    }
  }).then((foundSets) => {
    if (foundSets.length > 0) {
      return foundSets;
    } else {
      throw new Error("Unable to find requested sets");
    }
  });
}

// New function: Add a new set
function addSet(setData) {
  return Set.create(setData)
    .then(() => {
      return Promise.resolve();
    })
    .catch((err) => {
      return Promise.reject(err.errors[0].message);
    });
}

// New function: Edit an existing set
function editSet(setNum, setData) {
  return Set.update(setData, {
    where: { set_num: setNum }
  })
    .then(([rowsUpdated]) => {
      if (rowsUpdated > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error("Unable to find and update the requested set"));
      }
    })
    .catch((err) => {
      return Promise.reject(err.errors[0].message);
    });
}

// Delete an existing set
function deleteSet(setNum) {
  return Set.destroy({
    where: {
      set_num: setNum
    }
  })
  .then(() => {
    return Promise.resolve();
  })
  .catch((err) => {
    return Promise.reject(err.errors[0].message);
  });
}

// New function: Get all themes
function getAllThemes() {
  return Theme.findAll()
    .then((themes) => {
      return Promise.resolve(themes);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

module.exports = { 
  initialize, 
  getAllSets, 
  getSetByNum, 
  getSetsByTheme, 
  addSet, 
  getAllThemes, 
  editSet, 
  deleteSet 
};
