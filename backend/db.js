 const Pool=require("pg").Pool;
 const pool = new Pool(
  {
    user:"vrajshah1510",
    password:"vraj1510",
    host:"localhost",
    port: 5432,
    database: "socialmediaapp"
  }
 );
 module.exports=pool; 