// scripts/deploy.js
async function main() {
  // We get the contract to deploy
  const Cakia = await ethers.getContractFactory("Cakia");
  console.log(`Deploying ${"Cakia"}...`);
  const cakia = await Cakia.deploy();
  await cakia.deployed();
  console.log(`Cakia deployed to: ${cakia.address}`);

  const CakiaMint = await ethers.getContractFactory("CakiaMint");
  console.log(`Deploying ${"CakiaMint"}...`);
  const cakiaMint = await CakiaMint.deploy();
  await cakiaMint.deployed();
  console.log(`CakiaMint deployed to: ${cakiaMint.address}`);

  const CakiaNft = await ethers.getContractFactory("CakiaNft");
  console.log(`Deploying ${"CakiaNft"}...`);
  const cakiaNft = await CakiaNft.deploy();
  await cakiaNft.deployed();
  console.log(`CakiaNft deployed to: ${cakiaNft.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
