// module.exports = function(app) {
//     var User = app.models.users;
//     var Role = app.models.Role;
//     var RoleMapping = app.models.RoleMapping;
//     var Team = app.models.Team;
  
//     User.create([
//       {username: 'user', name: 'user', address: 'mohali', email: 'user@user.com', password: '123'},
//       {username: 'admin', name: 'admin', address: 'mohali', email: 'admin@admin.com', password: '123'}
//     ], function(err, users) {
//      if (err) console.log(err);
  
//       console.log('Created users:', users);  
  
  
//       //create the admin role
//       Role.create({
//         name: 'admin'
//       }, function(err, role) {
//         if (err) throw err;
  
//         console.log('Created role:', role);
  
//         //make bob an admin
//         role.principals.create({
//           principalType: RoleMapping.USER,
//           principalId: users[1].id
//         }, function(err, principal) {
//           if (err) throw err;
  
//           console.log('Created principal:', principal);
//         });
//       });
//     });
//   };