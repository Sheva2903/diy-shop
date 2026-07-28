import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getDistricts, getProvinces, getWards } from "../../api/provinces";
import { SelectField, TextField } from "../../components/ui/Field";

export type AddressValue = { provinceCity: string; district: string; ward: string };
export type AddressCodes = { province?: number; district?: number };

type Props = {
  value: AddressValue;
  codes: AddressCodes;
  errors: Partial<Record<keyof AddressValue, string>>;
  onChange: (patch: Partial<AddressValue>, codePatch?: Partial<AddressCodes>) => void;
  onBlurField: (field: keyof AddressValue) => void;
};

/**
 * Dependent province → district → ward selects. If the public address service
 * is unavailable the three controls degrade to free-text inputs so checkout
 * still works (the database stores plain strings either way).
 */
export function AddressSelects({ value, codes, errors, onChange, onBlurField }: Props) {
  const { t } = useTranslation();

  const provincesQuery = useQuery({
    queryKey: ["provinces"],
    queryFn: ({ signal }) => getProvinces(signal),
    staleTime: Infinity,
    retry: 1
  });

  const districtsQuery = useQuery({
    queryKey: ["districts", codes.province],
    queryFn: ({ signal }) => getDistricts(codes.province!, signal),
    enabled: !!codes.province,
    staleTime: Infinity,
    retry: 1
  });

  const wardsQuery = useQuery({
    queryKey: ["wards", codes.district],
    queryFn: ({ signal }) => getWards(codes.district!, signal),
    enabled: !!codes.district,
    staleTime: Infinity,
    retry: 1
  });

  if (provincesQuery.isError) {
    return (
      <>
        <TextField
          label={t("checkout.province")}
          required
          value={value.provinceCity}
          error={errors.provinceCity}
          onChange={(event) => onChange({ provinceCity: event.target.value })}
          onBlur={() => onBlurField("provinceCity")}
        />
        <TextField
          label={t("checkout.district")}
          required
          value={value.district}
          error={errors.district}
          onChange={(event) => onChange({ district: event.target.value })}
          onBlur={() => onBlurField("district")}
        />
        <TextField
          label={t("checkout.ward")}
          required
          value={value.ward}
          error={errors.ward}
          onChange={(event) => onChange({ ward: event.target.value })}
          onBlur={() => onBlurField("ward")}
        />
      </>
    );
  }

  return (
    <>
      <SelectField
        label={t("checkout.province")}
        required
        value={codes.province ?? ""}
        error={errors.provinceCity}
        disabled={provincesQuery.isPending}
        onBlur={() => onBlurField("provinceCity")}
        onChange={(event) => {
          const code = Number(event.target.value);
          const province = provincesQuery.data?.find((item) => item.code === code);
          onChange(
            { provinceCity: province?.name ?? "", district: "", ward: "" },
            { province: code || undefined, district: undefined }
          );
        }}
      >
        <option value="">
          {provincesQuery.isPending ? t("checkout.loadingAddress") : t("checkout.selectProvince")}
        </option>
        {provincesQuery.data?.map((province) => (
          <option key={province.code} value={province.code}>
            {province.name}
          </option>
        ))}
      </SelectField>

      <SelectField
        label={t("checkout.district")}
        required
        value={codes.district ?? ""}
        error={errors.district}
        disabled={!codes.province || districtsQuery.isPending}
        onBlur={() => onBlurField("district")}
        onChange={(event) => {
          const code = Number(event.target.value);
          const district = districtsQuery.data?.find((item) => item.code === code);
          onChange({ district: district?.name ?? "", ward: "" }, { district: code || undefined });
        }}
      >
        <option value="">
          {districtsQuery.isPending && codes.province
            ? t("checkout.loadingAddress")
            : t("checkout.selectDistrict")}
        </option>
        {districtsQuery.data?.map((district) => (
          <option key={district.code} value={district.code}>
            {district.name}
          </option>
        ))}
      </SelectField>

      <SelectField
        label={t("checkout.ward")}
        required
        value={value.ward}
        error={errors.ward}
        disabled={!codes.district || wardsQuery.isPending}
        onBlur={() => onBlurField("ward")}
        onChange={(event) => onChange({ ward: event.target.value })}
      >
        <option value="">
          {wardsQuery.isPending && codes.district
            ? t("checkout.loadingAddress")
            : t("checkout.selectWard")}
        </option>
        {wardsQuery.data?.map((ward) => (
          <option key={ward.code} value={ward.name}>
            {ward.name}
          </option>
        ))}
      </SelectField>
    </>
  );
}
