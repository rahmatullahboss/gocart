-- Create Enums
CREATE TYPE "OrderStatus" AS ENUM ('ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED');
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'STRIPE');

-- Create Tables
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "cart" JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE "Store" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "address" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "logo" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "contact" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "mrp" DOUBLE PRECISION NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "images" TEXT[] NOT NULL,
  "category" TEXT NOT NULL,
  "inStock" BOOLEAN NOT NULL DEFAULT true,
  "storeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Address" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "total" DOUBLE PRECISION NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'ORDER_PLACED',
  "userId" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "addressId" TEXT NOT NULL,
  "isPaid" BOOLEAN NOT NULL DEFAULT false,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isCouponUsed" BOOLEAN NOT NULL DEFAULT false,
  "coupon" JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE "OrderItem" (
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  PRIMARY KEY ("orderId", "productId")
);

CREATE TABLE "Rating" (
  "id" TEXT PRIMARY KEY,
  "rating" INTEGER NOT NULL,
  "review" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Coupon" (
  "code" TEXT PRIMARY KEY,
  "description" TEXT NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL,
  "forNewUser" BOOLEAN NOT NULL,
  "forMember" BOOLEAN NOT NULL DEFAULT false,
  "isPublic" BOOLEAN NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Keys
ALTER TABLE "Store"
  ADD CONSTRAINT "Store_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Address"
  ADD CONSTRAINT "Address_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_addressId_fkey"
  FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Rating"
  ADD CONSTRAINT "Rating_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Rating"
  ADD CONSTRAINT "Rating_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique Indexes
CREATE UNIQUE INDEX "Rating_userId_productId_orderId_key" ON "Rating" ("userId", "productId", "orderId");

