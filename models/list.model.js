const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(

  {

    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
      trim: true,
    },

    _userId: {  
      type: mongoose.Types.ObjectId,
      required: true
    },

  },

  {

    statics:{

      findByIdAndUserId(_id, _userId){
        return ListModel.findOne({ _id, _userId });
      }

    }

  }

)

const ListModel = mongoose.model('list', listSchema);

module.exports = ListModel ;