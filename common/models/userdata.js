'use strict';

module.exports = function(Userdata) {

    /*Promises */
    //Check is category is exists
    const ckCat = (name) =>{
        return new Promise((resolve,reject)=>{
            app.models.users.findOne({where: {"name":name}},
            (err,res)=>{
                if(res){
                    console.log(res);
                    resolve();
                }else{
                    reject(Error(`No Category Exits With name ${name}`));
                }
            })
        })
    }
    //Validate Data Before Saving
    Userdata.beforeRemote("create", (ctx, data, cb) => {
        console.log('usermodal');
        let req = ctx.req.body;
        if(req.category_name){       
            ckCat(req.category_name)
            .then(() => cb())
            .catch(error => cb(error))
        }else{
          var error = new Error();
          error.message = `Category Name isn't be Blank `;
          error.statusCode = 400;
            cb(error)
        }
    });

};
