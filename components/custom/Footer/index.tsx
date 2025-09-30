import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  return (
    <footer className='border-t-2'>
      <div
        className='container mx-auto px-4 py-6 text-center text-muted-foreground italic'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: must use for i18n dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: t.raw("copyright") }}
      />
    </footer>
  );
};

export { Footer };
