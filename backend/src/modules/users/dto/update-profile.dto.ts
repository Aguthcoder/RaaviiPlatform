import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'avatarUrl must be a valid URL' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @Length(2, 30, { each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  @Length(1, 32)
  personalityType?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @Length(2, 30, { each: true })
  personalityTraits?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(2, 30, { each: true })
  preferredEventTypes?: string[];

  @IsOptional()
  @IsString()
  @Length(1, 80)
  city?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  age?: number;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  @Matches(/^(male|female|non-binary|prefer-not-to-say)$/i, {
    message: 'gender must be one of male, female, non-binary, prefer-not-to-say',
  })
  gender?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  education?: string;
}
