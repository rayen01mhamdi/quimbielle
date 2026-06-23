-- CreateTable
CREATE TABLE "FormRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "positions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormRecord" ADD CONSTRAINT "FormRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
