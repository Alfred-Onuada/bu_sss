const HeaderInfo = require('./../../models/pages/header.page');
const FooterInfo = require('./../../models/pages/footer.page');
const indexInfo = require('./../../models/pages/index.page');

// though this data is generated within the source code use joi to still validate it
// in case of errors

function updateHeader(req, res) {
  console.log(`Request made to : ${req.url}`);

  const { newValue, affectedField, index } = req.body;
  
  // This query looks for and empty object {} which matches all the documents
  // but because there will only be one document per model it matches the correct one
  HeaderInfo.findOne({})
    .then(docs => {
      if (docs) {
        
        // make the edit to what was previously there
        const newData = docs[affectedField];
        newData[index] = newValue;
      
        // make the edit
        HeaderInfo.findByIdAndUpdate(docs._id, { [affectedField]: newData })
          .then(docs => {
            return res.status(200).send(newValue);
          })
          .catch(err => {
            console.log(err.message);
            return res.status(400).send("Oops! page edit failed, try again later");
          });

      } else {
        return res.status(400).send("Oops! page edit failed, try again later");
      }
    })
    .catch(err => {
      console.log(err.message);
      return res.status(400).send("Oops! page edit failed, try again later");
    });
   
}

function updateFooter(req, res) {
  console.log(`Request made to : ${req.url}`);

  const { newValue, affectedField, index } = req.body;
  
  // This query looks for and empty object {} which matches all the documents
  // but because there will only be one document per model it matches the correct one
  FooterInfo.findOne({})
    .then(docs => {
      if (docs) {
        
        // make the edit to what was previously there
        const newData = docs[affectedField];
        newData[index] = newValue;
      
        // make the edit
        FooterInfo.findByIdAndUpdate(docs._id, { [affectedField]: newData })
          .then(docs => {
            return res.status(200).send(newValue);
          })
          .catch(err => {
            console.log(err.message);
            return res.status(400).send("Oops! page edit failed, try again later");
          });

      } else {
        console.log(err.message);
        return res.status(500).send("Oops! page edit failed, try again later");
      }
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).send("Oops! page edit failed, try again later");
    });
   
}

function updateIndex(req, res) {
  console.log(`Request made to : ${req.url}`);

  const { newValue, pathToDBChange } = req.body;
  const path = pathToDBChange.split(','); // avoided during it on the frontend for security reasons
  
  // This query looks for and empty object {} which matches all the documents
  // but because there will only be one document per model it matches the correct one
  indexInfo.findOne({})
    .then(docs => {
      if (docs) {

        function updateValue(dataHead, path, newValue) {
          if (path.length > 1 && dataHead[path[0]]) {
            let temp = dataHead[path[0]];
    
            dataHead[path[0]] = updateValue(temp, path.splice(1, path.length-1), newValue)
    
            return dataHead;
          } else if (path.length === 1) {
            dataHead[path[0]] = newValue;
    
            return dataHead;
          }
        }

        docs = updateValue(docs, path, newValue);

        const affectedField = path[0]; // the affected field will be the first entry in the path
        const newData = docs[affectedField]; // the newData will be the value after passing through the updateValue function
      
        // make the edit
        indexInfo.findByIdAndUpdate(docs._id, { [affectedField]: newData })
          .then(docs => {
            return res.status(200).send(newValue);
          })
          .catch(err => {
            console.log(err.message);
            return res.status(400).send("Oops! page edit failed, try again later");
          });

      } else {
        console.log(err.message);
        return res.status(500).send("Oops! page edit failed, try again later");
      }
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).send("Oops! page edit failed, try again later");
    });
}

module.exports = {
  updateHeader,
  updateFooter,
  updateIndex
}