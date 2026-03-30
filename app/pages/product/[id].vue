<template>
  <NuxtLayout>
    <div class="min-h-screen px-3 md:px-0">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-xs py-3">
        <nuxt-link
          to="/"
          class="flex items-center text-gray-500 hover:text-[#388072] transition-colors"
        >
          <Icon class="w-4 h-4 mr-1" icon="mdi:home" />
          Home
        </nuxt-link>
        <Icon icon="mdi:chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-800 font-medium truncate">{{
          productDetail?.name
        }}</span>
      </nav>

      <!-- Main Product Section -->
      <div class="md:flex gap-8 mb-8">
        <!-- Image Section -->
        <div class="md:w-[40%] mb-6 md:mb-0">
          <div
            class="bg-white border border-gray-200 rounded-2xl p-4 sticky top-4"
          >
            <div class="relative overflow-hidden rounded-xl">
              <a-image
                class="w-full h-auto object-contain"
                :src="
                  productDetail?.path
                    ? `${imgBasePharma}/${productDetail?.path}`
                    : default_img
                "
                :fallback="default_img"
              />
              <!-- <span
                v-if="
                  productDetail?.vat_percent && productDetail?.vat_percent > 0
                "
                class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
              >
                {{ Number(productDetail?.vat_percent).toFixed(0) }}% VAT
              </span> -->
            </div>
            <!-- Thumbnail -->
            <div class="flex mt-3 gap-2" v-if="productDetail?.path">
              <div
                class="w-16 h-16 border-2 border-[#388072] rounded-lg overflow-hidden cursor-pointer"
              >
                <a-image
                  class="w-full h-full object-cover"
                  loading="lazy"
                  :src="
                    productDetail?.path
                      ? `${imgBasePharma}/${productDetail?.path}`
                      : default_img
                  "
                  :fallback="default_img"
                  alt="Product thumbnail"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Product Info Section -->
        <div class="md:w-[60%]">
          <!-- Title -->
          <h1
            class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2"
          >
            {{ productDetail?.name }}
          </h1>

          <!-- Generic & Category Tags -->
          <div class="flex flex-wrap items-center gap-2 mb-5">
            <span
              v-if="productDetail?.generic_name"
              class="inline-flex items-center gap-1.5 bg-[#388072]/10 text-[#388072] text-sm font-medium px-3 py-1 rounded-full"
            >
              <Icon icon="mdi:pill" class="w-4 h-4" />
              {{ productDetail?.generic_name }}
            </span>
            <span
              v-if="productDetail?.category_name"
              class="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"
            >
              <Icon icon="mdi:tag-outline" class="w-4 h-4" />
              {{ productDetail?.category_name }}
            </span>
          </div>

          <!-- Price Card -->
          <div
            class="bg-gradient-to-r from-[#388072]/5 to-emerald-50 border border-[#388072]/20 rounded-xl p-2 mb-5"
          >
            <p class="text-sm text-gray-500 mb-1">প্রতি ইউনিট মূল্য</p>
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-bold text-[#388072]">
                ৳{{ Number(productDetail?.selling_price || 0).toFixed(2) }}
              </span>
              <!-- <span
                v-if="
                  productDetail?.tp &&
                  productDetail?.selling_price &&
                  productDetail?.tp !== productDetail?.selling_price
                "
                class="text-lg text-gray-400 line-through"
              >
                ৳{{ Number(productDetail?.tp || 0).toFixed(2) }}
              </span> -->
              <span
                v-if="
                  productDetail?.tp &&
                  productDetail?.selling_price &&
                  productDetail?.tp > productDetail?.selling_price
                "
                class="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full"
              >
                {{
                  Math.round(
                    ((productDetail?.tp - productDetail?.selling_price) /
                      productDetail?.tp) *
                      100,
                  )
                }}% ছাড়
              </span>
            </div>
          </div>

          <!-- Stock & Supplier Info -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div
              class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="
                  stockQuantity(productDetail) > 0
                    ? 'bg-green-100'
                    : 'bg-red-100'
                "
              >
                <Icon
                  :icon="
                    stockQuantity(productDetail) > 0
                      ? 'mdi:check-circle'
                      : 'mdi:close-circle'
                  "
                  class="w-5 h-5"
                  :class="
                    stockQuantity(productDetail) > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                />
              </div>
              <div>
                <p class="text-xs text-gray-500">স্টক</p>
                <p class="font-bold text-gray-900">
                  {{ stockQuantity(productDetail) }}
                  <span class="text-xs font-normal text-gray-500">পিস</span>
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl"
            >
              <div
                class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <Icon icon="mdi:factory" class="w-5 h-5 text-blue-600" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-gray-500">সরবরাহকারী</p>
                <p class="font-bold text-gray-900 text-sm truncate">
                  {{ productDetail?.company_name || "-" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Add to Cart Button -->
          <div class="mb-6">
            <a-dropdown v-model:open="dropdownOpen" :trigger="['click']">
              <button
                :class="{
                  'opacity-50 cursor-not-allowed':
                    stockQuantity(productDetail) <= 0,
                }"
                :disabled="stockQuantity(productDetail) <= 0"
                type="button"
                class="bg-[#388072] hover:bg-[#2d6a5a] py-4 text-white w-full rounded-xl font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-[#388072]/20 active:scale-[0.98]"
                @click="handleDropdownClick"
              >
                <Icon icon="solar:cart-plus-bold" class="w-6 h-6" />
                <span>Add To Cart</span>
              </button>
              <template #overlay>
                <a-menu class="max-h-48 overflow-y-auto">
                  <a-menu-item
                    v-for="(item, index) in calculatedItems"
                    :key="item.index"
                    @click="
                      handleAddToCart(productDetail, item.quantity, index + 1)
                    "
                  >
                    <span class="text-xs">
                      {{
                        "(" +
                        Number(item.index) +
                        " " +
                        productDetail?.packsize +
                        ")"
                      }}
                      {{
                        productDetail?.category_name
                          ?.toLowerCase()
                          .includes("cap") ||
                        productDetail?.category_name
                          ?.toLowerCase()
                          .includes("tab")
                          ? Number(productDetail?.quantity) * Number(item.index)
                          : Number(productDetail?.quantity)
                      }}
                      {{ productDetail?.category_name }}
                      - ৳
                      {{
                        Number(
                          Number(item.index) *
                            Number(productDetail?.selling_price) *
                            Number(productDetail?.quantity),
                        ).toFixed(2)
                      }}
                    </span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>

          <!-- Product Description -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div
              class="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200"
            >
              <Icon
                icon="material-symbols-light:description-outline"
                class="w-5 h-5 text-[#388072]"
              />
              <h2 class="text-base font-bold text-gray-900">পণ্যের বিবরণ</h2>
            </div>

            <div class="p-5 space-y-3" v-if="productDetail?.name">
              <p class="text-gray-700">
                {{ productDetail?.name }}
              </p>
              <div
                v-if="productDetail?.generic_name"
                class="flex items-start gap-2"
              >
                <span class="font-semibold text-gray-900 whitespace-nowrap"
                  >জেনেরিক:</span
                >
                <span class="text-gray-700">{{
                  productDetail?.generic_name
                }}</span>
              </div>
              <div
                v-if="productDetail?.company_name"
                class="flex items-start gap-2"
              >
                <span class="font-semibold text-gray-900 whitespace-nowrap"
                  >সরবরাহকারী:</span
                >
                <span class="text-gray-700">{{
                  productDetail?.company_name
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <!-- Alternative Medicines Section - Disabled -->
        <div
          v-if="false"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <Icon icon="mdi:pill" class="w-5 h-5 text-green-600" />
              <h2 class="text-lg font-bold text-gray-900 dark:text-black">
                Alternative Medicines
              </h2>
              <span class="text-xs text-gray-500">(Same Generic)</span>
            </div>
            <span class="text-sm text-gray-500">
              {{ totalGenericProducts }} products found
            </span>
          </div>

          <!-- Scrollable container with ref for observation -->
          <div
            ref="alternativeMedicinesContainer"
            class="space-y-3 max-h-80 overflow-y-auto"
          >
            <!-- Alternative Product Items -->

            <div v-for="item in GenericProduct" :key="item.id">
              <nuxt-link :to="{ name: 'product-id', params: { id: item?.id } }">
                <div
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0"
                    >
                      <a-image
                        class="w-full h-full object-cover"
                        loading="lazy"
                        :src="
                          item?.path
                            ? `${imgBasePharma}/${item?.path}`
                            : default_img
                        "
                        :fallback="default_img"
                        alt="Alternative medicine"
                      />
                    </div>
                    <div>
                      <h3
                        class="font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {{ item?.name }}
                      </h3>
                      <p class="text-xs text-gray-600">
                        by {{ item?.company_name }}
                      </p>
                    </div>
                  </div>
                  <div class="text-left flex flex-col items-end space-y-1">
                    <span class="text-sm font-semibold"
                      >৳{{ Number(item?.selling_price).toFixed(2) }} /
                      {{ item?.category_name }}</span
                    >
                    <span
                      v-if="
                        Number(productDetail?.selling_price).toFixed(2) !==
                        Number(item?.selling_price).toFixed(2)
                      "
                      class="text-sm text-gray-500"
                    >
                      <span
                        v-if="
                          Number(productDetail?.selling_price).toFixed(2) >
                          Number(item?.selling_price).toFixed(2)
                        "
                        class="text-green-600"
                      >
                        {{
                          calculatePercentageDifference(
                            Number(productDetail?.selling_price).toFixed(2),
                            Number(item?.selling_price).toFixed(2),
                          )
                        }}% save
                      </span>
                      <span v-else class="text-red-600">
                        {{
                          calculatePercentageDifference(
                            Number(item?.selling_price).toFixed(2),
                            Number(productDetail?.selling_price).toFixed(2),
                          )
                        }}% costlier
                      </span>
                    </span>
                    <span v-else class="text-sm text-blue-500">
                      same price</span
                    >
                  </div>
                </div>
              </nuxt-link>
            </div>

            <!-- Infinite scroll trigger -->
            <div ref="infiniteScrollTrigger" class="py-3">
              <!-- Loading indicator -->
              <div
                v-if="GenericProductLoading && currentPage > 1"
                class="flex justify-center items-center space-x-2"
              >
                <Icon
                  icon="mdi:loading"
                  class="w-5 h-5 text-blue-600 animate-spin"
                />
                <span class="text-sm text-gray-600">Loading more...</span>
              </div>

              <!-- No more products message -->
              <div
                v-else-if="!hasMore && GenericProduct.length > 0"
                class="text-center text-sm text-gray-500 py-2"
              >
                <!-- No more alternative medicines available -->
              </div>

              <!-- Empty state -->
              <div
                v-else-if="
                  !GenericProductLoading && GenericProduct.length === 0
                "
                class="text-center text-sm text-gray-500 py-4"
              >
                No alternative medicines found
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { apiBasePharma, imgBasePharma } from "@/config";
import axios from "axios";
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
// import default_img from "../../assets/images/default.jpg";
import { useCartStore } from "@/stores/cart";
import { Icon } from "@iconify/vue";

// Route params
const route = useRoute();
const id = route?.params?.id;

// Product details
const productDetail = ref();
const Generic_id = ref();
const loading = ref(false);

// Cart
const cartStore = useCartStore();
const { getCart } = cartStore;

// Alternative medicines with pagination
const GenericProduct = ref([]);
const GenericProductLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const totalGenericProducts = ref(0);

// Refs for infinite scroll
const alternativeMedicinesContainer = ref(null);
const infiniteScrollTrigger = ref(null);
let observer = null;

const dropdownOpen = ref(false);
const calculatedItems = ref([]);

const handleDropdownClick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  dropdownOpen.value = false;

  const items = [];
  const maxPacks = Math.floor(
    stockQuantity(productDetail.value) / (productDetail.value?.quantity || 1),
  );

  for (let i = 1; i <= maxPacks; i++) {
    const quantity = i * (productDetail.value?.quantity || 1);
    const totalPrice = Number(
      i *
        Number(productDetail.value?.selling_price) *
        Number(productDetail.value?.quantity),
    ).toFixed(2);

    items.push({
      index: i,
      quantity: quantity,
      packQuantity: Number(productDetail.value?.quantity),
      totalPrice: totalPrice,
    });
  }

  calculatedItems.value = items;
  dropdownOpen.value = true;
};

// Get product details
const getProductDetails = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${apiBasePharma}/products/${id}`);
    loading.value = false;
    // API returns an array, get the first item
    productDetail.value = Array.isArray(res?.data) ? res?.data[0] : res?.data;
    Generic_id.value = productDetail.value?.generic_id;

    // After getting generic ID, fetch alternative products
    // Disabled for now
    // if (Generic_id.value) {
    //   await getGenericProduct(true);
    // }
  } catch (error) {
    console.error("Error fetching product details:", error);
    loading.value = false;
  }
};

// Get generic products with pagination
const getGenericProduct = async (reset = false) => {
  if (GenericProductLoading.value || !Generic_id.value) return;

  try {
    if (reset) {
      currentPage.value = 1;
      GenericProduct.value = [];
      hasMore.value = true;
    }

    GenericProductLoading.value = true;

    // Assuming your API supports pagination
    const res = await axios.get(
      `${apiBasePharma}/product-generic-wise/${Generic_id.value}?page=${currentPage.value}`,
    );

    GenericProductLoading.value = false;

    if (res?.data) {
      const newProducts =
        res?.data?.data.filter(
          (product) => String(product.id) !== String(id),
        ) || [];

      if (currentPage.value === 1) {
        GenericProduct.value = newProducts;
      } else {
        GenericProduct.value = [...GenericProduct.value, ...newProducts];
      }

      // Update total count
      totalGenericProducts.value =
        res?.data?.total || GenericProduct.value.length;

      // Check if there are more products to load
      hasMore.value = newProducts.length === pageSize.value;

      // Setup infinite scroll after first load
      if (currentPage.value === 1) {
        await nextTick();
        setupInfiniteScroll();
      }
    }
  } catch (error) {
    console.error("Error fetching generic products:", error);
    GenericProductLoading.value = false;

    // If the API doesn't support pagination, use the original approach
    if (currentPage.value === 1) {
      try {
        const res = await axios.get(
          `${apiBasePharma}/product-generic-wise/${Generic_id.value}`,
        );
        GenericProduct.value = res?.data?.data || [];
        totalGenericProducts.value = GenericProduct.value.length;
        hasMore.value = false;
      } catch (err) {
        console.error("Fallback error:", err);
      }
    }
  }
};

// Load more products
const loadMore = () => {
  if (hasMore.value && !GenericProductLoading.value) {
    currentPage.value += 1;
    getGenericProduct();
  }
};

// Setup Intersection Observer for infinite scroll
const setupInfiniteScroll = () => {
  if (!infiniteScrollTrigger.value || !alternativeMedicinesContainer.value)
    return;

  // Create intersection observer
  observer = new IntersectionObserver(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadMore();
      }
    },
    {
      root: alternativeMedicinesContainer.value,
      rootMargin: "50px",
      threshold: 0.1,
    },
  );

  // Start observing
  observer.observe(infiniteScrollTrigger.value);
};

// Add to cart
const handleAddToCart = (product, quantity, index) => {
  // Normalize product structure to match what the cart store expects
  const normalizedProduct = {
    ...product,
    product_prices: {
      selling_price: product?.selling_price || 0,
      ecom_final_selling_price:
        product?.ecom_final_selling_price || product?.selling_price || 0,
      ecom_discount_percentage: product?.ecom_discount_percentage || null,
      pack_quantity: product?.quantity || 1,
    },
    stock_batches: product?.stock_batches || [
      { balanced_quantity: product?.balanced_quantity || 0 },
    ],
    product_images:
      product?.product_images ||
      (product?.path ? [{ path: product.path }] : []),
  };
  getCart(normalizedProduct, quantity, index);
  dropdownOpen.value = false;
};

// Calculate stock quantity
const stockQuantity = (item) => {
  // The new API response has balanced_quantity directly
  return parseFloat(item?.balanced_quantity || 0);
};

//
const calculatePercentageDifference = (m1, m2) => {
  // Get max and min value
  const max = Math.max(m1, m2);
  const min = Math.min(m1, m2);

  // Calculate percentage difference
  const difference = ((max - min) / min) * 100;

  return difference.toFixed(2); // Return the percentage with 2 decimal places
};

// Lifecycle
onMounted(async () => {
  await getProductDetails();
});

onUnmounted(() => {
  // Cleanup observer
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
/* Custom scrollbar for alternative medicines */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Thumbnail scroll */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Button hover effects */
button {
  transition: all 0.2s ease-in-out;
}
</style>
