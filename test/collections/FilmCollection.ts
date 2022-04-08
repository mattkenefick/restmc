
import FilmModel from '../models/FilmModel';
import { Collection } from '../../src/index';

/**
 * Film Collection
 *
 * @type Collection
 */
export default class FilmCollection extends Collection
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
     * Model object instantiated by this collection
     *
     * @type FilmModel
     */
    // @ts-ignore Because webpack attempts to autoload this
    public model: FilmModel = FilmModel;
}
