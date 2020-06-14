import usb from 'usb'

/**
 * Class representing a TIC834 board
 */
class Tic {
    /**
     * Creates a Tic instance with optional serial_number. When serial number is absent, it will find the first matching device.
     * @param {usb.Device} device
     */
    constructor(device) {
        /**
         * @type {usb.Device}
         * @private
         */
        this.device_ = device;

        if (device == null) {
            throw new Error('No device found..');
        }

    }

    /**
     *
     * @param {String} serialNumber
     * @returns {Promise<Tic>}
     */
    static async initWithSerialNumber(serialNumber) {
        let devices = usb.getDeviceList();

        let lastSeenDevice = null;
        for (let i = 0; i < devices.length; i++) {
            let device = devices[i];
            if (device.deviceDescriptor.idVendor == 0x1ffb) {
                lastSeenDevice = device;
                let deviceSerialNumber = await this.getSerialNumber(device);
                if (deviceSerialNumber == serialNumber) {
                    return new Tic(device);
                }
            }
        }
        return new Tic(lastSeenDevice);
    }

    /**
     * @param {usb.Device} device
     * @return {Promise<String>}
     */
    static async getSerialNumber(device) {
        return new Promise((resolve, reject) => {
            device.open();
            let deviceDescriptor = device.deviceDescriptor;
            device.getStringDescriptor(deviceDescriptor.iManufacturer, function (err, manufacturer) {
                device.getStringDescriptor(deviceDescriptor.iProduct, function (err, product) {
                    device.getStringDescriptor(deviceDescriptor.iSerialNumber, function (err, serialNumber) {
                        console.log(manufacturer, product, serialNumber);
                        resolve(serialNumber);
                    });
                });
            });
        });
    }

    executeQuickCommand(command) {
        return new Promise((resolve, reject) => {
            this.device_.controlTransfer(0x40, command, 0, 0, new Uint8Array(0), (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    execute7bitCommand(command, value) {
        return new Promise((resolve, reject) => {
            this.device_.controlTransfer(0x40, command, value, 0, new Uint8Array(0), (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    execute32bitCommand(command, value) {
        let b = Buffer.alloc(4);
        b.writeInt32LE(value);
        return new Promise((resolve, reject) => {
            this.device_.controlTransfer(0x40, command, b.readUInt16LE(), b.readUInt16LE(2), new Uint8Array(0), (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    executeBlobReadCommand(command, offset, length) {
        return new Promise((resolve, reject) => {
            this.device_.controlTransfer(0xC0, command, 0, offset, length, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    async setPosition(position) {
        // https://www.pololu.com/docs/0J71/8#cmd-set-target-position
        await this.execute32bitCommand(0xE0, position);
    }

    /**
     * This command sets the target velocity of the Tic, in microsteps per 10,000 seconds.
     * @param velocity signed 32-bit, Range: −500,000,000 to +500,000,000, Units: microsteps per 10,000 s
     */
    async setTargetVelocity(velocity) {
        // https://www.pololu.com/docs/0J71/8#cmd-set-target-position
        await this.execute32bitCommand(0xE3, velocity);
    }

    async haltAndSetPosition(position) {
        await this.execute32bitCommand(0xEC, position);
    }

    async haltAndHold() {
        await this.executeQuickCommand(0x89);
    }

    async goHome() {
        await this.executeQuickCommand(0x97);
    }

    async resetCommandTimeout() {
        await this.executeQuickCommand(0x8C);
    }

    async deEnergize() {
        await this.executeQuickCommand(0x86);
    }

    async energize() {
        await this.executeQuickCommand(0x85);
    }

    async exitSafeStart() {
        await this.executeQuickCommand(0x83);
    }

    async enterSafeStart() {
        await this.executeQuickCommand(0x8F);
    }

    async reset() {
        await this.executeQuickCommand(0xB0);
    }

    async clearDriveError() {
        await this.executeQuickCommand(0x8A);
    }

    async setMaxSpeed(speed) {
        await this.execute32bitCommand(0xE6, speed);
    }

    async setStartingSpeed(speed) {
        await this.execute32bitCommand(0xE5, speed);
    }

    async setMaxAcceleration(acceleration) {
        await this.execute32bitCommand(0xEA, acceleration);
    }

    async setMaxDeceleration(deceleration) {
        await this.execute32bitCommand(0xE9, deceleration);
    }

    async setStepMode(mode) {
        await this.execute7bitCommand(0x94, mode);
    }

    async setCurrentLimit(limit) {
        await this.execute7bitCommand(0x91, mode);
    }

    async setDecayMode(decay) {
        /**
         Tic T834:
         0: Mixed 50%
         1: Slow
         2: Fast
         3: Mixed 25%
         4: Mixed 75%
         */
        await this.execute7bitCommand(0x92, decay);
    }

    async getVariable(offset, length) {
        return await this.executeBlobReadCommand(0xA1, offset, length);
    }


    async getPosition() {
        let buffer = await this.getVariable(34, 4);
        return buffer.readInt32LE();
    }


}

let sleep = async (x) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, x)
    });
}

let init = async () => {
    let t = await Tic.initWithSerialNumber('00305458');
    let p = await t.getPosition()
    console.log(p)
    await t.setPosition(p + 2000)
    let count = 0;
    let d0 = new Date();
    while (true) {
        let x = await t.getPosition();
        if (x == p + 2000) {
            break;
        }
        await sleep(1)
        count++;
        //console.log(`${count} times, not there yet`)
    }
    let d1 = new Date();
    console.log(`${count} times, ${d1 - d0}, finally!`);
};
//init();

export {Tic}

