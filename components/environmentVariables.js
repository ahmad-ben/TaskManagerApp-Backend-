module.exports = () => {
  const NODE_ENV = process.env.NODE_ENV; 
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
  const PORT = process.env.PORT;
  const DATABASE_URL = process.env.DATABASE_URL;

  const envVarsArray = [NODE_ENV, JWT_SECRET_KEY, PORT, DATABASE_URL];
  const envVarsNamesArray = ['NODE_ENV', 'JWT_SECRET_KEY', 'PORT', 'DATABASE_URL'];

  envVarsArray.map((envVar, envVarIndex) => {
    if(envVar == undefined) 
      throw Error(`The environment variable '${envVarsNamesArray[envVarIndex]}' is undefined.`)
  }); 

}