import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NotificationValidationPipe implements PipeTransform {
  async transform(value: any) {
    const { notificationType } = value;

    let validationErrors: any[] = [];

    if (notificationType === 'PUSH') {
      // Validate required fields for PUSH notification
      const requiredFieldsForPush = [
        'senderId',
        'pushTokens',
        'title',
        'message',
      ];
      validationErrors = this.validateFields(value, requiredFieldsForPush);
    } else {
      // Validate required fields for non-PUSH notification
      const requiredFieldsForNonPush = [
        'senderId',
        'fullName',
        'title',
        'message',
      ];
      validationErrors = this.validateFields(value, requiredFieldsForNonPush);
    }

    if (validationErrors.length > 0) {
      // Format errors as a string or object for the BadRequestException
      const errorMessages = validationErrors
        .map((error) => `${error.field}: ${error.message}`)
        .join(', ');
      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }

    return value;
  }

  private validateFields(value: any, requiredFields: string[]) {
    const errors: any[] = [];
    requiredFields.forEach((field) => {
      if (!value[field]) {
        errors.push({
          field,
          message: `${field} is required`,
        });
      }
    });
    return errors;
  }
}
