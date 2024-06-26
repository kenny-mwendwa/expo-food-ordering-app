import Button from "@/components/Button";
import { Control, Controller, useController, useForm } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardTypeOptions,
  Image,
  Alert,
} from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { defaultPizzaImage } from "@/components/ProductListItem";

const formValuesSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(3, { message: "Name must be greater than 3 characters long" })
    .max(20, { message: "Name must be less than 20 characters long" }),
  price: z.string({
    required_error: "Price is required",
  }),
  imageUrl: z
    .string({
      required_error: "Image is required",
      invalid_type_error: "Invalid image URL",
    })
    .url({ message: "Invalid image URL format" }),
});

type FormValues = z.infer<typeof formValuesSchema>;

type InputProps = {
  name: keyof FormValues;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  control: Control<FormValues>;
};

function Input({ name, placeholder, keyboardType, control }: InputProps) {
  const { field } = useController({
    control,
    defaultValue: "",
    name,
  });

  return (
    <TextInput
      value={field.value}
      onChangeText={field.onChange}
      placeholder={placeholder}
      keyboardType={keyboardType}
      style={styles.input}
    />
  );
}

export default function ProductFormScreen() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formValuesSchema),
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const { productId } = useLocalSearchParams();
  const isUpdating = !!productId;

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log("Image result:", result);

    if (!result.canceled) {
      setValue("imageUrl", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    setValue("imageUrl", "");
  }, [setValue]);

  const onCreate = async (data: FormValues) => {
    const numericPrice = parseFloat(data.price);

    // Check if the parsed value is not a valid number
    if (Number.isNaN(numericPrice)) {
      setPriceError("Price must be a valid number");
      return;
    }

    // Check if the parsed value is different from the original string value
    if (numericPrice.toString() !== data.price) {
      setPriceError("Price contains invalid characters");
      return;
    }

    // Check if the price is less than or equal to 0
    if (numericPrice <= 0) {
      setPriceError("Price must be greater than 0");
      return;
    }

    // Clear any previous price error
    setPriceError(null);

    try {
      const response = await fetch("http://192.168.0.100:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const responseData = await response.json();
      console.log(responseData); // Handle response data as needed
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const onUpdate = (data: FormValues) => {
    const numericPrice = parseFloat(data.price);

    // Check if the parsed value is not a valid number
    if (Number.isNaN(numericPrice)) {
      setPriceError("Price must be a valid number");
      return;
    }

    // Check if the parsed value is different from the original string value
    if (numericPrice.toString() !== data.price) {
      setPriceError("Price contains invalid characters");
      return;
    }

    // Check if the price is less than or equal to 0
    if (numericPrice <= 0) {
      setPriceError("Price must be greater than 0");
      return;
    }

    // Clear any previous price error
    setPriceError(null);

    console.log("Updating product...", data);
  };

  const onSubmit = (data: FormValues) => {
    if (isUpdating) {
      onUpdate(data);
    } else {
      onCreate(data);
    }
  };

  const onDelete = () => {
    console.log("Deleting...");
  };

  const confirmDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this product", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: isUpdating ? "Update Product" : "Create Product" }}
      />
      {errors.name && (
        <Text style={styles.errorMessage}>{errors.name.message}</Text>
      )}
      {(errors.price || priceError !== null) && (
        <Text style={styles.errorMessage}>
          {errors.price?.message || priceError}
        </Text>
      )}
      {errors.imageUrl && (
        <Text style={styles.errorMessage}>{errors.imageUrl.message}</Text>
      )}
      <Controller
        name="imageUrl"
        control={control}
        render={() => (
          <>
            {imageUri && (
              <Image
                source={{ uri: imageUri || defaultPizzaImage }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
            <Text style={styles.textButton} onPress={() => pickImage()}>
              Select Image
            </Text>
          </>
        )}
      />

      <Text style={styles.label}>Name</Text>
      <Input name="name" placeholder="Name" control={control} />
      <Text style={styles.label}>Price</Text>
      <Input
        name="price"
        placeholder="9.99"
        keyboardType="numeric"
        control={control}
      />
      <Button
        text={isUpdating ? "Update" : "Create"}
        onPress={handleSubmit(onSubmit)}
      />

      {isUpdating && (
        <Text onPress={confirmDelete} style={styles.textButton}>
          Delete
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  image: {
    width: "50%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },
  label: {
    color: "gray",
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
  },
});
