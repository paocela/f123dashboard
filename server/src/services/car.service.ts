export class CarService {
    private readonly MAX_DRIVERS_PER_CAR = 2;

    assignCars(
        driverPoints: Map<number, number>,
        carsScore: Map<number, number>,
        balanceFactor: number = 1,
        toleranceFactor: number = 0.05
    ): Map<number, number> {
        if (driverPoints.size === 0 || carsScore.size === 0) {
            return new Map();
        }
        if (balanceFactor < 0.2 || balanceFactor > 1) {
            throw new Error("Balance factor must be between 0.2 and 1");
        }
        if (toleranceFactor < 0.01 || toleranceFactor > 0.5) {
            throw new Error("Tolerance factor must be between 0.01 and 0.5");
        }
        if (driverPoints.size > carsScore.size * 2) {
            throw new Error("Not enough cars for the number of drivers");
        }

        const drivers = this.mapAndSort(driverPoints, false).map(d => ({ driverId: d.id, points: d.value }));
        const cars = this.mapAndSort(carsScore, true).map(c => ({ carId: c.id, score: c.value }));

        const driverRange = { min: Math.min(...drivers.map(d => d.points)), max: Math.max(...drivers.map(d => d.points)) };
        const carRange = { min: Math.min(...cars.map(c => c.score)), max: Math.max(...cars.map(c => c.score)) };
        const averageCarScore = this.calculateAverageCarScore(cars);

        const driversWithIdealCar = drivers.map(d =>
            this.calculateDriverWithIdealCar(d, driverRange, carRange, averageCarScore, balanceFactor)
        );

        driversWithIdealCar.sort((a, b) => a.idealCar - b.idealCar);

        return this.matchDriversToCarsWithGrouping(driversWithIdealCar, cars, toleranceFactor);
    }

    private mapAndSort(map: Map<number, number>, ascending: boolean = false) {
        return [...map.entries()]
            .map(([id, value]) => ({ id, value }))
            .sort((a, b) => ascending ? a.value - b.value : b.value - a.value);
    }

    private calculateAverageCarScore(cars: Array<{ carId: number; score: number }>) {
        return cars.reduce((sum, car) => sum + car.score, 0) / cars.length;
    }

    private calculateDriverWithIdealCar(
        driver: { driverId: number; points: number },
        driverRange: { min: number; max: number },
        carRange: { min: number; max: number },
        averageCarScore: number,
        balanceFactor: number
    ) {
        const normalizedPoints = this.normalizePoints(driver.points, driverRange.min, driverRange.max);
        let idealCar = carRange.min + normalizedPoints * (carRange.max - carRange.min);
        idealCar = averageCarScore + (idealCar - averageCarScore) * balanceFactor;

        return { ...driver, idealCar };
    }

    private matchDriversToCarsWithGrouping(
        driversWithIdealCar: Array<{ driverId: number; points: number; idealCar: number }>,
        cars: Array<{ carId: number; score: number }>,
        toleranceFactor: number
    ) {
        if (driversWithIdealCar.length === 0 || cars.length === 0) {
            return new Map();
        }

        const assignment = new Map<number, number>();
        const carCapacity = new Map<number, number>(); // Track how many drivers per car

        // Initialize car capacity tracking
        cars.forEach(car => {
            carCapacity.set(car.carId, 0);
        });

        // Assign each driver to the best matching available car
        driversWithIdealCar.forEach(driver => {
            let bestCarId: number | null = null;
            let bestDistance = Infinity;
            let bestCapacity = Infinity;

            // Find car with best match (smallest distance from ideal car value) that has capacity
            cars.forEach(car => {
                const currentCapacity = carCapacity.get(car.carId) || 0;
                
                // Only consider cars that have space
                if (currentCapacity < this.MAX_DRIVERS_PER_CAR) {
                    const distance = Math.abs(car.score - driver.idealCar);
                    
                    // Primary: minimize distance to ideal car score
                    // Secondary: prefer cars with fewer drivers (to spread assignments)
                    if (distance < bestDistance || (distance === bestDistance && currentCapacity < bestCapacity)) {
                        bestDistance = distance;
                        bestCapacity = currentCapacity;
                        bestCarId = car.carId;
                    }
                }
            });

            // Assign driver to best matching car
            if (bestCarId !== null) {
                assignment.set(driver.driverId, bestCarId);
                carCapacity.set(bestCarId, (carCapacity.get(bestCarId) || 0) + 1);
            }
        });

        return assignment;
    }
    
    private normalizePoints(
        value: number,
        min: number,
        max: number
    ): number {
        if (max === min) return 0.5;
        return (value - min) / (max - min);
    }
  
}