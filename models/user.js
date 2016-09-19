'use strict';

var bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
  // format from docs: define(modelName, attributes, [options])
  // [options] must be contained in a single object!
  var user = sequelize.define('user', {
    firstName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1, 99],
          msg: 'Name must be between 1 and 99 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1, 99],
          msg: 'Name must be between 1 and 99 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'Invalid email address, try again'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8, 99],
          msg: 'Password must be between 8 and 99 characters'
        }
      }
    }
  }, {
    hooks: {
      beforeCreate: function (createdUser, options, cb) {
        // hash the password
        var hash = bcrypt.hashSync(createdUser.password, 10);
        // store the hash as the user's password
        createdUser.password = hash;

        // sanitise the data: first-letter cap for firstName & lastName
        // TODO: refactor into a function with 2 params
        var firstName = createdUser.firstName;  // sanitise firstName
        firstName = firstName.split(' ');
        for (var i = 0; i < firstName.length; i++) {
          var elem = firstName[i];
          elem = elem.replace(elem.charAt(0), elem.charAt(0).toUpperCase());
          // replace old array elem with sanitised string elem
          firstName.splice(i, 1, elem);
        }
        firstName = firstName.join(' ');

        var lastName = createdUser.lastName;  // sanitise lastName
        lastName = lastName.split(' ');
        for (var j = 0; j < lastName.length; j++) {
          var el = lastName[j];
          el = el.replace(el.charAt(0), el.charAt(0).toUpperCase());
          // replace old array el with sanitised string el
          lastName.splice(j, 1, el);
        }
        lastName = lastName.join(' ');

        // updating the createdUser obj with sanitised names
        createdUser.firstName = firstName;
        createdUser.lastName = lastName;

        // continue to save the user, with no errors
        cb(null, createdUser);
      }
    },
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    },
    instanceMethods: {
      validPassword: function (password) {
        // return true if the password matches the hash
        return bcrypt.compareSync(password, this.password);
      },
      toJSON: function () {
        // get the user's JSON data
        var jsonUser = this.get();
        // sanitise: delete the password from the JSON data, and return
        delete jsonUser.password;
        return jsonUser;
      }
    }
  });
  return user;
};
