import { NativeModules, Platform } from 'react-native';

const { SkycoinModule } = NativeModules;

if (!SkycoinModule) {
  throw new Error(
    'SkycoinModule is not linked. Make sure you are using a development build, not Expo Go.'
  );
}

class WalletService {
  /**
   * Generate addresses from seed
   * @param {string} seed - mnemonic or raw seed string
   * @param {number} count - number of addresses
   */
  static async getAddresses(seed, count = 1) {
    try {
      const result = await SkycoinModule.getAddresses(seed, count);

      // Your native method returns JSON string
      return JSON.parse(result);
    } catch (error) {
      console.error('getAddresses error:', error);
      throw error;
    }
  }

  /**
   * Generate new mnemonic
   */
  static async newWordSeed() {
    try {
      return await SkycoinModule.newWordSeed();
    } catch (error) {
      console.error('newWordSeed error:', error);
      throw error;
    }
  }

  /**
   * Prepare transaction
   */
  static async prepareTransaction(inputs, outputs) {
    try {
      const inputsBody = JSON.stringify(inputs);
      const outputsBody = JSON.stringify(outputs);

      return await SkycoinModule.prepareTransaction(
        inputsBody,
        outputsBody
      );
    } catch (error) {
      console.error('prepareTransaction error:', error);
      throw error;
    }
  }
}

export default WalletService;