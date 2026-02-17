import { AllDataSchema } from '../schemas';
import axios from 'axios';
import { config } from '../config';

async function validate() {
  console.log('Fetching data from:', config.DATA_URL);
  try {
    const response = await axios.get(config.DATA_URL);
    const data = response.data;

    console.log('Data fetched. Validating...');
    const result = AllDataSchema.safeParse(data);

    if (result.success) {
      console.log('✅ Schema validation SUCCESS!');
    } else {
      console.error('❌ Schema validation FAILED');
      console.error(JSON.stringify(result.error.format(), null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

validate();
