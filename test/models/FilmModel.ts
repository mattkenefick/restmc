
import FilmCollection from '../collections/FilmCollection';
import UserCollection from '../collections/UserCollection';
import UserModel from '../models/UserModel';
import { Model } from '../../src/index';

/**
 * Film Model
 *
 * @type Model
 */
export default class FilmModel extends Model
{
    /**
     * Endpoint key
     *
     * https://api.sotw.com/v1/{endpoint}
     *
     * @type string
     */
    public endpoint: string = 'film';

    /**
     * List of fields available
     *
     * @type string[]
     */
    public fields: string[] = [
        'id',
        'source_type',
        'source_url',
        'start_time',
        'end_time',
        'duration',
        'website',
        'publicity',
        'publicity_type',
        'is_external',
    ];


    // Relationships
    // -------------------------------------------------------------------------

    public get firstUser(): UserModel
    {
        return this.hasOne('firstUser', UserModel);
    }

    public get user(): UserCollection
    {
        return this.hasMany('user', UserCollection);
    }
}
