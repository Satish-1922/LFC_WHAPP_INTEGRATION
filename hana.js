const hanaClient = require('@sap/hana-client');

const connParams = {
  serverNode: process.env.HANA_HOST + ':' + process.env.HANA_PORT,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
  encrypt: true,
  sslValidateCertificate: false
};

function getConnection() {
  const conn = hanaClient.createConnection();
  conn.connect(connParams);
  return conn;
}

module.exports = { getConnection };
