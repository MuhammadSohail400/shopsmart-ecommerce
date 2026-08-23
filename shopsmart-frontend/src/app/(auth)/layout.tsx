import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 md:p-8">
      <Link
        href="/"
        className="mb-8 transition-transform duration-300 hover:scale-105"
      >
        <Image
          src="/asora-logo-transparent.png"
          alt="ASORA"
          width={180}
          height={50}
          className="h-10 sm:h-11 w-auto object-contain"
          priority
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
