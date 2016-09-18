'use strict';
module.exports = function (sequelize, DataTypes) {
  var savedUrl = sequelize.define('savedUrl', {
    userid: DataTypes.INTEGER,
    url: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  });
  return savedUrl;
};
