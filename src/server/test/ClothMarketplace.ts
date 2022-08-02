import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("ClothMarketplace", function () {
  async function deployClothMarketplaceFixture() {
    const [contractOwner, account1, account2, account3] = await ethers.getSigners();
    const ClothMarketplace = await ethers.getContractFactory("ClothMarketplace");
    const clothMarketplace = await ClothMarketplace.deploy();

    return { clothMarketplace, contractOwner, account1, account2, account3 } as {
      clothMarketplace: Contract;
      contractOwner: SignerWithAddress;
      account1: SignerWithAddress;
      account2: SignerWithAddress;
      account3: SignerWithAddress;
    };
  }

  async function addClothesFixture(
    iterationsToAccount1: number,
    iterationsToAccount2: number,
    iterationsToAccount3: number,
    customQuantity?: number,
  ) {
    const { clothMarketplace, contractOwner, account1, account2, account3 } = await loadFixture(
      deployClothMarketplaceFixture,
    );

    if (iterationsToAccount1 > 0) {
      // Add clothes to account1
      for (let i = 0; i < iterationsToAccount1; i++) {
        await clothMarketplace.addCloth(
          "Test",
          ethers.utils.parseEther("0.01"),
          customQuantity ?? 10,
          account1.address,
        );
      }
    }
    if (iterationsToAccount2 > 0) {
      // Add clothes to account2
      for (let i = 0; i < iterationsToAccount2; i++) {
        await clothMarketplace.addCloth(
          "Test",
          ethers.utils.parseEther("0.01"),
          customQuantity ?? 10,
          account2.address,
        );
      }
    }
    if (iterationsToAccount3 > 0) {
      // Add clothes to account3
      for (let i = 0; i < iterationsToAccount3; i++) {
        await clothMarketplace.addCloth(
          "Test",
          ethers.utils.parseEther("0.01"),
          customQuantity ?? 10,
          account3.address,
        );
      }
    }

    return { clothMarketplace, contractOwner, account1, account2, account3 };
  }

  describe("Deployment", function () {
    it("Should set the right contract owner", async function () {
      const { clothMarketplace, contractOwner } = await loadFixture(deployClothMarketplaceFixture);
      expect(await clothMarketplace.contractOwner()).to.equal(contractOwner.address);
    });
  });

  describe("Setters", function () {
    describe("addCloth", function () {
      it("Validations", async function () {
        const { clothMarketplace, account1 } = await loadFixture(deployClothMarketplaceFixture);

        await expect(
          clothMarketplace.addCloth("Test Cloth", ethers.utils.parseEther("0"), 20, account1.address),
        ).to.be.rejectedWith("Price must be greater than 0");
        await expect(
          clothMarketplace.addCloth("Test Cloth", ethers.utils.parseEther("1"), 0, account1.address),
        ).to.be.rejectedWith("Quantity must be greater than 0");
      });

      it("Should add clothes to the customer with correct input values", async function () {
        const { clothMarketplace, account1 } = await loadFixture(deployClothMarketplaceFixture);
        const fnParams = {
          name: "Test Cloth",
          price: ethers.utils.parseEther("0.001"),
          quantity: 20,
          owner: account1.address,
        };
        await clothMarketplace.addCloth(fnParams.name, fnParams.price, fnParams.quantity, fnParams.owner);
        const addedCloth = await clothMarketplace.clothes(0);

        expect(addedCloth).to.exist;
        expect(addedCloth.name).to.equal(fnParams.name);
        expect(addedCloth.price).to.equal(fnParams.price);

        expect(await clothMarketplace.customerClothes(account1.address, addedCloth.id)).to.equal(fnParams.quantity);
      });
    });
  });

  describe("Getters", function () {
    describe("getCustomers", function () {
      it("Should return all customers", async function () {
        const { clothMarketplace } = await loadFixture(addClothesFixture.bind(null, 1, 1, 2));
        expect((await clothMarketplace.getCustomers()).length).to.be.equal(3);
      });
    });

    describe("getClothsByOwner", function () {
      it("Should return an empty array if no clothes are found", async function () {
        const { clothMarketplace, account1 } = await loadFixture(deployClothMarketplaceFixture);
        expect((await clothMarketplace.getClothsByOwner(account1.address)).length).to.equal(0);
      });

      it("Should return the correct clothes with quantity for the given owner", async function () {
        const clothesToBeCreated = 3;
        const customQuantity = 20;
        const { clothMarketplace, account1 } = await loadFixture(
          addClothesFixture.bind(null, clothesToBeCreated, 2, 0, customQuantity),
        );

        const clothes = await clothMarketplace.getClothsByOwner(account1.address);
        expect(clothes.length).to.equal(clothesToBeCreated);
        expect(clothes[0]).to.have.property("id");
        expect(clothes[0].quantity).to.equal(customQuantity);
      });
    });
  });

  describe("Transactions", function () {
    describe("buyCloth", function () {
      it("Validations", async function () {
        const CLOTH_ID = 0;
        const QUANTITY = 20;
        const { clothMarketplace, account1, account2 } = await loadFixture(
          addClothesFixture.bind(null, 1, 1, 0, QUANTITY),
        );

        await expect(
          clothMarketplace.connect(account1).buyCloth(account1.address, CLOTH_ID, QUANTITY),
        ).to.be.rejectedWith("You cannot buy your own cloth");
        await expect(clothMarketplace.connect(account2).buyCloth(account1.address, CLOTH_ID, 0)).to.be.rejectedWith(
          "Quantity must be greater than 0",
        );
        await expect(
          clothMarketplace.connect(account2).buyCloth(account1.address, CLOTH_ID, QUANTITY + 1),
        ).to.be.rejectedWith("Seller do not have enough cloths to sell");
      });

      it("Should buy clothes and transfer funds to _seller correctly", async function () {
        const { clothMarketplace, account1, account2 } = await loadFixture(deployClothMarketplaceFixture);

        const QUANTITY_ADDED_CLOTHES = 20;
        const QUANTITY_TO_BUY = 5;
        const PRICE = ethers.utils.parseEther("0.01");

        const fnParams = {
          name: "Test Cloth",
          price: PRICE,
          quantity: QUANTITY_ADDED_CLOTHES,
          owner: account1.address,
        };
        await clothMarketplace.addCloth(fnParams.name, fnParams.price, fnParams.quantity, fnParams.owner);

        await clothMarketplace.connect(account2).deposit({ value: PRICE.mul(QUANTITY_TO_BUY) });
        await clothMarketplace.connect(account2).buyCloth(account1.address, 0, QUANTITY_TO_BUY);
        expect(await clothMarketplace.customerClothes(account2.address, 0)).to.equal(QUANTITY_TO_BUY);
        expect(await clothMarketplace.customerClothes(account1.address, 0)).to.equal(
          QUANTITY_ADDED_CLOTHES - QUANTITY_TO_BUY,
        );
      });
    });
  });
});
