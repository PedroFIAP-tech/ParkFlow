import Image from "next/image";

export function BrandLogo({
  className = "",
  priority = false
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative h-12 w-56 ${className}`}>
      <Image
        src="/smartpark-security-logo.png"
        alt="SmartPark Security"
        fill
        priority={priority}
        sizes="(max-width: 768px) 220px, 280px"
        className="object-contain object-left"
      />
    </div>
  );
}
