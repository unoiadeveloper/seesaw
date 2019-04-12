'use strict';
var app = require('../../server/server');
module.exports = function(Hire) {
/* Define Promises  */
    //Check Hirer ID
    const ckHirer = (hirerId) =>{
        return new Promise((resolve,reject)=>{
            app.models.users.findById(hirerId,
            (err,res)=>{
                if(res){
                    resolve();
                }else{
                    reject(Error(`No User Found With Id ${hirerId}`));
                }
            })
        })
    }
    //Set Hiree ID
    const setHiree = (serviceId) =>{
        return new Promise((resolve,reject)=>{
            app.models.services.findById(serviceId,
            (err,res)=>{
                if(res){
                    console.log(res.usersId)
                    resolve(res.usersId)
                }else{
                    reject(Error(`No Service Found with id  ${serviceId}`));
                }
            })
        })
    }
    // is service is already Hired?
    const isAlreadyHired = (hireeId,hirerId,servicesId) =>{
        return new Promise((resolve,reject)=>{
            Hire.findOne({where: {"hireeId":hireeId, "servicesId" : servicesId, "hirerId" : hirerId}},
            (err,res)=>{
                if(res){
                    reject(Error(`You Already Hired User[${hireeId}] for Service[${servicesId}]`));
                }else{;
                    resolve()
                }
            })
        })
    }
/* End Promises*/
//Validate Data Before Saving
    Hire.beforeRemote("create", (ctx, data, cb) => {
        let req = ctx.req.body;
        if(req.hirerId && req.servicesId){       
            ckHirer(req.hirerId)
            .then(() => setHiree(req.servicesId))
            .then((hireeId)=> {
                req.hireeId = hireeId;
            return isAlreadyHired(hireeId, req.hirerId, req.servicesId);
            })
            .then(response => cb(null, response))
            .catch(error => cb(error))
        }else{
          var error = new Error();
          error.message = `Service ID, Hirer ID & Where isn't be Blank `;
          error.statusCode = 400;
            cb(error)
        }
    })

};
