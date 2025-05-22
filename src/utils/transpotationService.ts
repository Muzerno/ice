import { UUID } from "crypto";
import AxiosInstances from "./axiosInstance";

export async function findAllCar() {
  try {
    const car = await AxiosInstances.get("/transportation/car");
    return Promise.resolve(car.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function findAllCarWithLine() {
  try {
    const car = await AxiosInstances.get("/transportation/carWitLine");
    return Promise.resolve(car.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateCar(
  car_id: number | null | undefined,
  params: any
) {
  try {
    const car = await AxiosInstances.put(
      `/transportation/car/${car_id}`,
      params
    );
    return Promise.resolve(car);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteCar(car_id: number) {
  try {
    const car = await AxiosInstances.delete(`/transportation/car/${car_id}`);
    return Promise.resolve(car);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createCar(params: any) {
  try {
    const car = await AxiosInstances.post("/transportation/car", params);
    return Promise.resolve(car);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createTransportationLine(params: any) {
  try {
    const transportationLine = await AxiosInstances.post(
      "/transportation",
      params
    );
    return transportationLine;
  } catch (error: any) {
    // ดึง message จาก backend มาส่งกลับ
    return {
      status: error.response?.status || 500,
      data: error.response?.data || { message: "Unknown error" },
    };
  }
}

export async function findAllTransportationLine() {
  try {
    const transportationLine = await AxiosInstances.get("/transportation");
    return Promise.resolve(transportationLine.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const updateCustomerStepsInLine = async (
  line_id: number,
  customerSteps: { cus_id: string, step: number }[]
) => {
  try {
    console.log(`[API] Updating customer steps for line ${line_id}:`, customerSteps);

    const response = await AxiosInstances.patch(
      `/transportation/${line_id}/update-steps`,
      {
        customers: customerSteps,
      }
    );

    console.log(`[API] Response:`, response.data);
    return response;
  } catch (error) {
    console.error(`[API] Error updating customer steps:`, error);
    throw error;
  }
};

export async function addCustomersToLine(params: any) {
  try {
    const res = await AxiosInstances.post(
      "/transportation/line/add-customers",
      params
    );
    return Promise.resolve({
      status: res.status,
      data: res.data,
    });
  } catch (error: any) {
    return Promise.reject(error?.response ?? error);
  }
}

export async function updateTransportationLine(id: number, params: any) {
  try {
    const transportationLine = await AxiosInstances.put(
      `/transportation/${id}`,
      params
    );
    return Promise.resolve(transportationLine);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteTransportationLineWithIds(ids: number | number[]) {
  try {
    const normalizedIds = Array.isArray(ids) ? ids : [ids]; // ✅ บังคับให้เป็น array
    const transportationLine = await AxiosInstances.patch(
      `/transportation/delete`,
      {
        ids: normalizedIds,
      }
    );
    return Promise.resolve(transportationLine);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteCustomerFromLine(lineId: number, cusId: number) {
  try {
    const res = await AxiosInstances.delete(
      `/transportation/${lineId}/customer/${cusId}`
    );
    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getDeliveryByCarId(cus_id: number, date: string) {
  try {
    const delivery = await AxiosInstances.get(
      `/transportation/line/byCar/${cus_id}`,
      { params: { date } }
    );
    return Promise.resolve(delivery.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateDeliveryStatus(drop_id: number, body: any) {
  try {
    const delivery = await AxiosInstances.patch(
      `/transportation/update/DeliveryStatus/${drop_id}`,
      body
    );
    return Promise.resolve(delivery);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateLocation(id: number, params: any) {
  try {
    const delivery = await AxiosInstances.patch(
      `/transportation/update/location/${id}`,
      params
    );
    return Promise.resolve(delivery);
  } catch (error) {
    return Promise.reject(error);
  }
}
