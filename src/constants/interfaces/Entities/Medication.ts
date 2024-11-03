import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { activeIngredientType, categoryType } from "@/constants/interfaces/Entities"

export type medicationType = {
    id?: string,
    name: string,
    category: categoryType,
    dosage: Float,
    activeIngredient: activeIngredientType,
    maxTakingTime: Float,
    timeBetween: Float,
    band: number,
    quantityMl: number,
    quantityInt: number
}

export type medicationErrorType = {
    name?: string;
    category?: string;
    dosage?: string;
    activeIngredient?: string;
    maxTakingTime?: string;
    timeBetween?: string;
    band?: string;
    quantityMl?: string;
    quantityInt?: string;
}