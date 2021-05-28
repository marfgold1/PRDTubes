class DeviceStore { 
  addDevice(deviceKey, info){}
  getDevices(){}
  isDeviceValid(deviceKey){}
  getDeviceInfo(deviceKey){}
  setDeviceInfo(deviceKey, key, value){}
  getDeviceDataAll(deviceKey){}
  getDeviceDataInIdx(deviceKey, dataIdx){}
  addDeviceData(deviceKey, data) {}
}

class DataStore {
  create(deviceKey){}
  add(deviceKey, data){}
  getAll(deviceKey){}
  get(deviceKey, idx){}
}

class MemoryDataStore extends DataStore {
  constructor(){
    super();
    this.data = {};
  }
  create(deviceKey){
    this.data[deviceKey] = [];
  }
  add(deviceKey, data){
    this.data[deviceKey].push(data);
  }
  getAll(deviceKey){
    return this.data[deviceKey];
  }
  get(deviceKey, idx){
    if (this.data[deviceKey].length > 0)
      if (0 <= idx && idx <= this.data[deviceKey].length-1)
        return this.data[deviceKey][idx];
    return null;
  }
}

class MemoryDeviceStore extends DeviceStore {
  constructor(){
    super();
    this.devices = {};
    this.dataStorage = new MemoryDataStore();
  }

  addDevice(deviceKey, info){
    const create = !this.isDeviceValid(deviceKey);
    if (create)
      this.dataStorage.create(deviceKey);
    this.devices[deviceKey] = info;
    return create;
  }

  getDevices(){
    return Object.keys(this.devices);
  }

  isDeviceValid(deviceKey){
    return deviceKey in this.devices;
  }

  getDeviceInfo(deviceKey){
    return this.devices[deviceKey];
  }

  setDeviceInfo(deviceKey, key, value){
    this.devices[deviceKey][key] = value;
  }

  getDeviceDataAll(deviceKey){
    return this.dataStorage.getAll(deviceKey);
  }

  getDeviceDataInIdx(deviceKey, dataIdx){
    return this.dataStorage.get(deviceKey, dataIdx);
  }

  addDeviceData(deviceKey, data) {
    this.dataStorage.add(deviceKey, data);
  }
}

class RedisDataStore extends DataStore {
  constructor(redisClient){
    super();
    this.client = redisClient;
  }
  async add(deviceKey, data){
    await this.client.rpush(`device.${deviceKey}`, data);
  }
  async getAll(deviceKey){
    return await this.client.lrange(`device.${deviceKey}`, 0, -1);
  }
  async get(deviceKey, idx){
    return await this.client.lindex(`device.${deviceKey}`, idx);
  }
}

class RedisDeviceStore extends DeviceStore {
  constructor(redisClient){
    super();
    this.dataStorage = new RedisDataStore(redisClient);
    this.client = redisClient;
  }
  async addDevice(deviceKey, info){
    const isCreated = !await this.isDeviceValid(deviceKey);
    if (isCreated){
      await this.client.multi()
      .rpush("app.devices", deviceKey)
      .hmset(`device.${deviceKey}.info`, info)
      .exec();
    } else {
      await this.client.hmset(`device.${deviceKey}.info`, info);
    }
    return isCreated;
  }
  async getDevices(){
    return await this.client.lrange("app.devices", 0, -1);
  }
  async isDeviceValid(deviceKey){
    const devices = await this.client.lrange("app.devices", 0, -1);
    return devices.includes(deviceKey);
  }
  async getDeviceInfo(deviceKey){
    return await this.client.hgetall(`device.${deviceKey}.info`);
  }
  async setDeviceInfo(deviceKey, key, value){
    await this.client.hset(`device.${deviceKey}.info`, key, value);
  }
  async getDeviceDataAll(deviceKey){
    return await this.dataStorage.getAll(deviceKey);
  }
  async getDeviceDataInIdx(deviceKey, dataIdx){
    return await this.dataStorage.get(deviceKey, dataIdx);
  }
  async addDeviceData(deviceKey, data) {
    await this.dataStorage.add(deviceKey, data);
  }
}

module.exports = {
  MemoryDeviceStore,
  RedisDeviceStore
};